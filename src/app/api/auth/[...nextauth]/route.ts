import NextAuth, { AuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/library/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { sendCustomVerificationEmail } from '@/utils/emails';

const resend = new Resend(process.env.RESEND_API_KEY!);

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),

    providers: [
        EmailProvider({
            server: '', // Not required with Resend
            from: process.env.EMAIL_FROM!,
            sendVerificationRequest: async ({ identifier }) => {
                console.log('📧 Sending verification email to', identifier);
                await sendCustomVerificationEmail(identifier);
            },
        }),

        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Missing credentials');
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    console.log('❌ User not found');
                    return null;
                }

                if (!user.emailVerified) {
                    throw new Error('Please verify your email before logging in.');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    console.log('❌ Invalid password');
                    return null;
                }

                console.log('✅ Logged in:', user.email);

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name ?? user.email,
                };
            },
        }),
    ],

    session: {
        strategy: 'jwt' as const, // ✅ typed correctly
    },

    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                // @ts-ignore - if user has a custom 'role'
                token.role = user.role;
            }
            return token;
        },

        async session({ session, token }: { session: Session; token: JWT }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.email = token.email;
                // @ts-ignore - extend session user object to include role
                session.user.role = token.role;
            }
            return session;
        },
    },

    pages: {
        signIn: '/hospital/login',
        verifyRequest: '/auth/verify',
        newUser: '/hospital/dashboard',
        error: '/hospital/login',
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
