import NextAuth, { NextAuthOptions } from "next-auth"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: process.env.WLD_CLIENT_ID || 'app_staging_502ff015c07323c89e4cd835f1b77ecc',
      clientSecret: process.env.WLD_CLIENT_SECRET || "sk_6d711206a9790cf9a3a8b11a4399f9a4ce215bcbf7f79ea7",
      idToken: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          credentialType: profile["https://id.worldcoin.org/beta"].credential_type,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin"
      return token
    },
  },
}

export default NextAuth(authOptions)