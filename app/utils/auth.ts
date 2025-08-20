import { createAuthClient } from "better-auth/vue";

export const { signIn, signUp, useSession, signOut, getSession } =
  createAuthClient({
    fetchOptions: {
      throw: true,
    },
  });

export const useUser = () => {
  const session = useSession();
  type User = (typeof session.value)["data"]["user"];
  return computed(() => session.value?.data?.user as User | null | undefined);
};
