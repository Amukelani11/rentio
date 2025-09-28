import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

export interface AgreementData {
  renterName: string
  renterEmail: string
  listerName: string
  listerEmail: string
  businessName?: string
  itemName: string
  itemDescription: string
  startDate: string
  endDate: string
  duration: number
  dailyRate: number
  depositAmount: number
  totalAmount: number
  deliveryType: string
  deliveryAddress?: string
  pickupLocation: string
  terms: string[]
  depositPolicy: string
  cancellationPolicy: string
  damagePolicy: string
}

export interface GeneratedAgreement {
  agreementNumber: string
  content: string
  data: AgreementData
}

const AGREEMENT_TEMPLATE = `
RENTAL AGREEMENT

This Rental Agreement ("Agreement") is entered into on {CURRENT_DATE} between:

RENTER:
{renterName}
Email: {renterEmail}

LISTER/BUSINESS:
{listerName}
{businessName && `Business: ${businessName}`}
Email: {listerEmail}

ITEM DETAILS:
Item: {itemName}
Description: {itemDescription}
Rental Period: {startDate} to {endDate} ({duration} days)
Daily Rate: R{dailyRate}
Total Rental Cost: R{totalAmount}
Security Deposit: R{depositAmount}

DELIVERY/PICKUP:
Delivery Type: {deliveryType}
{deliveryAddress && `Delivery Address: ${deliveryAddress}`}
Pickup Location: {pickupLocation}

TERMS AND CONDITIONS:

1. RENTAL PERIOD
The rental period begins on {startDate} and ends on {endDate}. The Renter agrees to return the item in the same condition as received.

2. PAYMENT
Total payment of R{totalAmount} is due at the time of rental. A security deposit of R{depositAmount} will be held and refunded upon satisfactory return of the item.

3. SECURITY DEPOSIT
{depositPolicy}

4. CANCELLATION POLICY
{cancellationPolicy}

5. DAMAGE AND LIABILITY
{damagePolicy}

6. ITEM CONDITION
The Renter acknowledges that they have inspected the item and found it to be in good working condition. Any pre-existing damage must be noted at pickup.

7. RETURN CONDITION
The item must be returned in the same condition as received, allowing for normal wear and tear. The Renter is responsible for any damage beyond normal wear.

8. LATE RETURN
Late returns will incur additional charges at the daily rate for each day overdue.

9. PROHIBITED USES
The Renter agrees not to use the item for any illegal activities or in violation of any laws.

10. GOVERNING LAW
This Agreement is governed by the laws of South Africa.

RENTER SIGNATURE: ___________________________ DATE: ___________

LISTER SIGNATURE: ___________________________ DATE: ___________

Agreement Number: {agreementNumber}
`

export async function generateAgreement(bookingId: string): Promise<GeneratedAgreement> {
  try {
    // Fetch booking details with related data
    const { data: booking, error } = await serviceClient
      .from('bookings')
      .select(`
        *,
        renter:users!renter_id(id, name, email),
        listing:listings(*, user:users(id, name, email), business:businesses(id, name))
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      throw new Error('Booking not found')
    }

    const agreementData: AgreementData = {
      renterName: booking.renter.name,
      renterEmail: booking.renter.email,
      listerName: (booking.listing as any).user?.name || (booking.listing as any).business?.name || 'Individual Lister',
      listerEmail: (booking.listing as any).user?.email || 'N/A',
      businessName: (booking.listing as any).business?.name,
      itemName: (booking.listing as any).title,
      itemDescription: (booking.listing as any).description || 'No description provided',
      startDate: new Date(booking.start_date).toLocaleDateString('en-ZA'),
      endDate: new Date(booking.end_date).toLocaleDateString('en-ZA'),
      duration: booking.duration,
      dailyRate: booking.unit_price,
      depositAmount: booking.deposit_amount,
      totalAmount: booking.total_amount,
      deliveryType: booking.delivery_type || 'PICKUP',
      deliveryAddress: booking.delivery_address,
      pickupLocation: (booking.listing as any).location || 'To be arranged',
      terms: getStandardTerms(),
      depositPolicy: getDepositPolicy(),
      cancellationPolicy: getCancellationPolicy(),
      damagePolicy: getDamagePolicy()
    }

    // Generate agreement content using AI (for now, use template)
    const content = generateAgreementContent(agreementData)

    // Generate unique agreement number
    const agreementNumber = `RA-${Date.now()}-${bookingId.slice(-8).toUpperCase()}`

    return {
      agreementNumber,
      content,
      data: agreementData
    }

  } catch (error) {
    console.error('Error generating agreement:', error)
    throw error
  }
}

function generateAgreementContent(data: AgreementData): string {
  const currentDate = new Date().toLocaleDateString('en-ZA')

  return AGREEMENT_TEMPLATE
    .replace('{CURRENT_DATE}', currentDate)
    .replace('{renterName}', data.renterName)
    .replace('{renterEmail}', data.renterEmail)
    .replace('{listerName}', data.listerName)
    .replace('{businessName}', data.businessName || '')
    .replace('{listerEmail}', data.listerEmail)
    .replace('{itemName}', data.itemName)
    .replace('{itemDescription}', data.itemDescription)
    .replace('{startDate}', data.startDate)
    .replace('{endDate}', data.endDate)
    .replace('{duration}', data.duration.toString())
    .replace('{dailyRate}', data.dailyRate.toString())
    .replace('{totalAmount}', data.totalAmount.toString())
    .replace('{depositAmount}', data.depositAmount.toString())
    .replace('{deliveryType}', data.deliveryType)
    .replace('{deliveryAddress}', data.deliveryAddress || 'N/A')
    .replace('{pickupLocation}', data.pickupLocation)
    .replace('{depositPolicy}', data.depositPolicy)
    .replace('{cancellationPolicy}', data.cancellationPolicy)
    .replace('{damagePolicy}', data.damagePolicy)
    .replace('{agreementNumber}', generateAgreementNumber())
}

function generateAgreementNumber(): string {
  return `RA-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
}

function getStandardTerms(): string[] {
  return [
    'Renter must be 18+ years old',
    'Valid ID required for rental',
    'Item must be returned on time',
    'No smoking or pets in rental vehicles',
    'Report any issues immediately',
    'Follow all manufacturer guidelines'
  ]
}

function getDepositPolicy(): string {
  return `A security deposit of R{depositAmount} will be held and refunded within 3-5 business days after satisfactory return of the item. The deposit may be used to cover any damages, late fees, or cleaning costs.`
}

function getCancellationPolicy(): string {
  return `Cancellations made more than 24 hours before rental start will receive a full refund. Cancellations within 24 hours will receive a 50% refund. No refunds for cancellations after rental period begins.`
}

function getDamagePolicy(): string {
  return `Renter is responsible for any damage beyond normal wear and tear. Damage assessment will be done by the lister upon return. Renter may be liable for repair or replacement costs.`

export async function saveAgreement(bookingId: string, agreement: GeneratedAgreement): Promise<void> {
  const { error } = await serviceClient
    .from('rental_agreements')
    .insert({
      booking_id: bookingId,
      agreement_number: agreement.agreementNumber,
      agreement_content: agreement.content,
      agreement_data: agreement.data,
      status: 'DRAFT'
    })

  if (error) {
    throw new Error(`Failed to save agreement: ${error.message}`)
  }
}

export async function getAgreement(bookingId: string): Promise<any> {
  const { data, error } = await serviceClient
    .from('rental_agreements')
    .select('*')
    .eq('booking_id', bookingId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch agreement: ${error.message}`)
  }

  return data
}
