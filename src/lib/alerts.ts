import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'
// SMS support is optional; implement when Twilio is configured
async function sendSMS(_: { to: string; body: string }) { return }

interface StockAlertCheck {
  id: string
  business_id: string
  inventory_item_id: string
  alert_type: string
  threshold_quantity?: number
  threshold_percentage?: number
  notify_email: boolean
  notify_sms: boolean
  notification_frequency: string
  is_active: boolean
  last_triggered_at?: string
  is_resolved: boolean
  business_email?: string
  business_phone?: string
  item_name: string
  current_quantity: number
  sku: string
}

export class StockAlertService {
  private supabase: any

  constructor() {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration')
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  }

  async checkAndTriggerAlerts(): Promise<void> {
    try {
      console.log('Starting stock alert check...')

      // Get all active stock alerts that need checking
      const alertsToCheck = await this.getAlertsToCheck()

      for (const alert of alertsToCheck) {
        const shouldTrigger = this.shouldTriggerAlert(alert)

        if (shouldTrigger) {
          await this.triggerAlert(alert)
        }
      }

      console.log(`Stock alert check completed. Processed ${alertsToCheck.length} alerts.`)
    } catch (error) {
      console.error('Error in stock alert check:', error)
    }
  }

  private async getAlertsToCheck(): Promise<StockAlertCheck[]> {
    const { data: alerts, error } = await this.supabase
      .from('stock_alerts')
      .select(`
        *,
        businesses (
          email,
          phone
        ),
        inventory_items (
          available_quantity,
          listings (
            title
          )
        )
      `)
      .eq('is_active', true)
      .eq('is_resolved', false)

    if (error) {
      console.error('Error fetching alerts:', error)
      return []
    }

    // Filter alerts that should be checked based on frequency and last triggered
    const now = new Date()
    return alerts.filter((alert: any) => {
      if (!alert.last_triggered_at) return true

      const lastTriggered = new Date(alert.last_triggered_at)
      const hoursSinceLastTrigger = (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60)

      switch (alert.notification_frequency) {
        case 'ONCE':
          return false // Already triggered once
        case 'DAILY':
          return hoursSinceLastTrigger >= 24
        case 'WEEKLY':
          return hoursSinceLastTrigger >= 168 // 7 days
        default:
          return true
      }
    }).map((alert: any) => ({
      id: alert.id,
      business_id: alert.business_id,
      inventory_item_id: alert.inventory_item_id,
      alert_type: alert.alert_type,
      threshold_quantity: alert.threshold_quantity,
      threshold_percentage: alert.threshold_percentage,
      notify_email: alert.notify_email,
      notify_sms: alert.notify_sms,
      notification_frequency: alert.notification_frequency,
      is_active: alert.is_active,
      last_triggered_at: alert.last_triggered_at,
      is_resolved: alert.is_resolved,
      business_email: alert.businesses?.email,
      business_phone: alert.businesses?.phone,
      item_name: alert.inventory_items?.listings?.title || 'Unknown Item',
      current_quantity: alert.inventory_items?.available_quantity || 0,
      sku: alert.inventory_items?.sku || 'UNKNOWN'
    }))
  }

  private shouldTriggerAlert(alert: StockAlertCheck): boolean {
    const { alert_type, threshold_quantity, threshold_percentage, current_quantity } = alert

    switch (alert_type) {
      case 'LOW_STOCK':
        if (threshold_quantity && current_quantity <= threshold_quantity) return true
        if (threshold_percentage) {
          // Assuming we need total quantity to calculate percentage
          // For now, we'll use a simple threshold check
          return current_quantity <= Math.ceil(threshold_percentage)
        }
        return false

      case 'OUT_OF_STOCK':
        return current_quantity === 0

      case 'REORDER_POINT':
        return threshold_quantity ? current_quantity <= threshold_quantity : false

      case 'MAINTENANCE_DUE':
        // This would require maintenance schedule data
        return false

      default:
        return false
    }
  }

  private async triggerAlert(alert: StockAlertCheck): Promise<void> {
    try {
      console.log(`Triggering alert for item: ${alert.item_name}`)

      const emailMessage = this.generateEmailMessage(alert)
      const smsMessage = this.generateSMSMessage(alert)

      // Send notifications
      const notificationPromises = []

      if (alert.notify_email && alert.business_email) {
        notificationPromises.push(
          this.sendEmailNotification(alert, emailMessage)
        )
      }

      if (alert.notify_sms && alert.business_phone) {
        notificationPromises.push(
          this.sendSMSNotification(alert, smsMessage)
        )
      }

      await Promise.all(notificationPromises)

      // Update alert with last triggered time
      await this.supabase
        .from('stock_alerts')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', alert.id)

      console.log(`Alert triggered successfully for item: ${alert.item_name}`)
    } catch (error) {
      console.error('Error triggering alert:', error)
    }
  }

  private generateEmailMessage(alert: StockAlertCheck): string {
    const { item_name, current_quantity, alert_type, threshold_quantity, threshold_percentage } = alert

    let subject = `Stock Alert: ${item_name}`
    let message = ''

    switch (alert_type) {
      case 'LOW_STOCK':
        subject = `Low Stock Alert: ${item_name}`
        message = `Low stock alert for ${item_name} (SKU: ${alert.sku}).\n\nCurrent quantity: ${current_quantity}`
        if (threshold_quantity) {
          message += `\nThreshold: ${threshold_quantity}`
        }
        if (threshold_percentage) {
          message += `\nThreshold: ${threshold_percentage}% of total stock`
        }
        break

      case 'OUT_OF_STOCK':
        subject = `Out of Stock Alert: ${item_name}`
        message = `${item_name} (SKU: ${alert.sku}) is now out of stock.\n\nPlease restock soon to avoid missing rental opportunities.`
        break

      case 'REORDER_POINT':
        subject = `Reorder Point Reached: ${item_name}`
        message = `Reorder point reached for ${item_name} (SKU: ${alert.sku}).\n\nCurrent quantity: ${current_quantity}\nReorder threshold: ${threshold_quantity}\n\nPlease place a reorder soon.`
        break

      case 'MAINTENANCE_DUE':
        subject = `Maintenance Due: ${item_name}`
        message = `Maintenance is due for ${item_name} (SKU: ${alert.sku}).\n\nCurrent quantity: ${current_quantity}\n\nPlease schedule maintenance to ensure item availability.`
        break
    }

    message += `\n\nThis is an automated notification from your business dashboard.\n\nTo manage your alerts, visit your dashboard.`
    message += `\n\nTo stop receiving these notifications, you can disable this alert in your dashboard settings.`

    return message
  }

  private generateSMSMessage(alert: StockAlertCheck): string {
    const { item_name, current_quantity, alert_type, threshold_quantity } = alert

    let message = `Rentio Alert: `

    switch (alert_type) {
      case 'LOW_STOCK':
        message += `Low stock for ${item_name}. Current: ${current_quantity}`
        if (threshold_quantity) {
          message += `, Threshold: ${threshold_quantity}`
        }
        break

      case 'OUT_OF_STOCK':
        message += `${item_name} is out of stock. Please restock soon.`
        break

      case 'REORDER_POINT':
        message += `Reorder point reached for ${item_name}. Current: ${current_quantity}, Threshold: ${threshold_quantity}`
        break

      case 'MAINTENANCE_DUE':
        message += `Maintenance due for ${item_name}. Current quantity: ${current_quantity}`
        break
    }

    message += ` - Rentio Dashboard`
    return message
  }

  private async sendEmailNotification(alert: StockAlertCheck, message: string): Promise<void> {
    try {
      const notificationData = {
        stock_alert_id: alert.id,
        notification_type: 'EMAIL' as const,
        recipient: alert.business_email!,
        message,
        status: 'PENDING' as const,
        created_at: new Date().toISOString()
      }

      // Log the notification attempt
      const { data: notification, error: logError } = await this.supabase
        .from('alert_notifications')
        .insert(notificationData)
        .select()
        .single()

      if (logError) {
        console.error('Error logging email notification:', logError)
        return
      }

      // Send the email
      try {
        await sendEmail({
          to: alert.business_email!,
          subject: this.getEmailSubject(alert),
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`
        })

        // Update notification status
        await this.supabase
          .from('alert_notifications')
          .update({
            status: 'SENT',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        console.log(`Email notification sent to ${alert.business_email}`)
      } catch (emailError) {
        console.error('Error sending email:', emailError)

        // Update notification status to failed
        await this.supabase
          .from('alert_notifications')
          .update({
            status: 'FAILED',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
          })
          .eq('id', notification.id)
      }
    } catch (error) {
      console.error('Error in email notification process:', error)
    }
  }

  private async sendSMSNotification(alert: StockAlertCheck, message: string): Promise<void> {
    try {
      const notificationData = {
        stock_alert_id: alert.id,
        notification_type: 'SMS' as const,
        recipient: alert.business_phone!,
        message,
        status: 'PENDING' as const,
        created_at: new Date().toISOString()
      }

      // Log the notification attempt
      const { data: notification, error: logError } = await this.supabase
        .from('alert_notifications')
        .insert(notificationData)
        .select()
        .single()

      if (logError) {
        console.error('Error logging SMS notification:', logError)
        return
      }

      // Send the SMS
      try {
        await sendSMS({
          to: alert.business_phone!,
          body: message
        })

        // Update notification status
        await this.supabase
          .from('alert_notifications')
          .update({
            status: 'SENT',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        console.log(`SMS notification sent to ${alert.business_phone}`)
      } catch (smsError) {
        console.error('Error sending SMS:', smsError)

        // Update notification status to failed
        await this.supabase
          .from('alert_notifications')
          .update({
            status: 'FAILED',
            error_message: smsError instanceof Error ? smsError.message : 'Unknown error'
          })
          .eq('id', notification.id)
      }
    } catch (error) {
      console.error('Error in SMS notification process:', error)
    }
  }

  private getEmailSubject(alert: StockAlertCheck): string {
    const { item_name, alert_type } = alert

    switch (alert_type) {
      case 'LOW_STOCK':
        return `Low Stock Alert: ${item_name}`
      case 'OUT_OF_STOCK':
        return `Out of Stock Alert: ${item_name}`
      case 'REORDER_POINT':
        return `Reorder Point Reached: ${item_name}`
      case 'MAINTENANCE_DUE':
        return `Maintenance Due: ${item_name}`
      default:
        return `Stock Alert: ${item_name}`
    }
  }
}

// Export a singleton instance
export const stockAlertService = new StockAlertService()

// Function to run the alert check (can be called by a cron job)
export async function runStockAlertCheck(): Promise<void> {
  await stockAlertService.checkAndTriggerAlerts()
}