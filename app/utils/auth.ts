import { createAuthClient } from "better-auth/vue";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  fetchOptions: {
    throw: true,
  },
});
