import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Ensures the current user exists in the database
 * Creates the user if they don't exist (upsert logic)
 * Call this in API routes or server components that need user data
 */
export async function ensureUserInDatabase() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    try {
        // Check if user exists in database
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUser.id))
            .limit(1);

        if (existingUser.length > 0) {
            // User exists, return it
            return existingUser[0];
        }

        // User doesn't exist, create it
        console.log('Creating user in database:', clerkUser.id);

        const newUser = await db
            .insert(users)
            .values({
                clerkId: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                name: clerkUser.firstName && clerkUser.lastName
                    ? `${clerkUser.firstName} ${clerkUser.lastName}`
                    : clerkUser.firstName || clerkUser.lastName || null,
                imageUrl: clerkUser.imageUrl || null,
                subscriptionTier: 'ritel',
                subscriptionStatus: 'active',
            })
            .returning();

        console.log('✅ User created in database:', clerkUser.id);

        return newUser[0];
    } catch (error) {
        console.error('Error ensuring user in database:', error);
        throw error;
    }
}

/**
 * Gets the current user from the database
 * Creates them if they don't exist
 */
export async function getCurrentUserFromDB() {
    return ensureUserInDatabase();
}
