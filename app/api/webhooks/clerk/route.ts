import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
    // Get the webhook secret from environment
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    // Verify the webhook signature
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400,
        })
    }

    // Handle the webhook event
    const eventType = evt.type

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        if (!id) {
            return new Response('Missing user ID', { status: 400 })
        }

        try {
            // Insert or update user in database (Upsert)
            await db
                .insert(users)
                .values({
                    clerkId: id,
                    email: email_addresses[0]?.email_address || '',
                    name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
                    imageUrl: image_url || null,
                    subscriptionTier: 'ritel',
                    subscriptionStatus: 'active',
                })
                .onConflictDoUpdate({
                    target: users.clerkId,
                    set: {
                        email: email_addresses[0]?.email_address || '',
                        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
                        imageUrl: image_url || null,
                        updatedAt: new Date(),
                    },
                })

            console.log('✅ User created/updated in database:', id)
        } catch (error) {
            console.error('❌ Error creating user in database:', error)
            return new Response('Error creating user', { status: 500 })
        }
    }

    if (eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        if (!id) {
            return new Response('Missing user ID', { status: 400 })
        }

        try {
            // Update user in database
            await db
                .update(users)
                .set({
                    email: email_addresses[0]?.email_address || '',
                    name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
                    imageUrl: image_url || null,
                    updatedAt: new Date(),
                })
                .where(eq(users.clerkId, id))

            console.log('✅ User updated in database:', id)
        } catch (error) {
            console.error('❌ Error updating user in database:', error)
            return new Response('Error updating user', { status: 500 })
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data

        if (!id) {
            return new Response('Missing user ID', { status: 400 })
        }

        try {
            // Delete user from database (cascade will handle related records)
            await db.delete(users).where(eq(users.clerkId, id))

            console.log('✅ User deleted from database:', id)
        } catch (error) {
            console.error('❌ Error deleting user from database:', error)
            return new Response('Error deleting user', { status: 500 })
        }
    }

    return new Response('Webhook processed successfully', { status: 200 })
}
