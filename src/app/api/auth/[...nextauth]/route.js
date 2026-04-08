import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const email = user.email;
        
        console.log('=== OAuth SignIn Callback ===');
        console.log('User email:', email);
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
        
        if (!email) {
          console.error('No email provided by OAuth provider');
          return false;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/validate`;
        console.log('Calling backend validation:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            name: user.name,
            googleId: account.providerAccountId,
            image: user.image
          }),
        });

        console.log('Backend response status:', response.status);
        const data = await response.json();
        console.log('Backend response data:', data);

        if (!response.ok || !data.success || !data.allowed) {
          console.error('User not allowed:', data.error);
          return false;
        }

        console.log('User validated successfully');
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email
            }),
          });

          const data = await response.json();

          if (data.success && data.user) {
            token.userId = data.user.id;
            token.role = data.user.role;
            token.email = data.user.email;
            token.name = data.user.name;
            // Don't store permissions in token - fetch from backend when needed
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        // Permissions will be fetched from backend API when needed
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
