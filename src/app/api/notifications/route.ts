import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { Role as UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const unread = searchParams.get('unread') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = { userId: user.id }

    if (type) {
      where.type = type
    }

    if (unread) {
      where.read = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: notifications,
        total,
        unreadCount,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, action } = body

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 })
    }

    switch (action) {
      case 'mark_read':
        await prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
            userId: user.id,
          },
          data: {
            read: true,
            readAt: new Date(),
          },
        })
        break

      case 'mark_unread':
        await prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
            userId: user.id,
          },
          data: {
            read: false,
            readAt: null,
          },
        })
        break

      case 'delete':
        await prisma.notification.deleteMany({
          where: {
            id: { in: notificationIds },
            userId: user.id,
          },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Notifications ${action.replace('_', ' ')} successfully`,
    })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all notifications for the user
    await prisma.notification.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'All notifications deleted successfully',
    })
  } catch (error) {
    console.error('Delete notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
