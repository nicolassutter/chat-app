async function getMiddlewareSession() {
  const session = useSession();

  if (session.value.data) {
    return session.value.data;
  }

  return await getSession();
}

export default defineNuxtRouteMiddleware(async (to) => {
  const isAuthPage = to.matched.some((match) => {
    return match.path === "/login" || match.path === "/signup";
  });

  const isPublicRoute = isAuthPage;
  const isProtectedRoute = !isPublicRoute;

  const session = await getMiddlewareSession();
  const user = session?.user;
  const isLoggedIn = !!user;

  if (isPublicRoute) {
    return; // Public route, no guard needed
  }
  if (isLoggedIn && isProtectedRoute) {
    return; // User is logged in and on a protected route
  }
  if (!isLoggedIn && isProtectedRoute) {
    return navigateTo("/login"); // Redirect to login if not logged in on a protected route
  }
  return navigateTo("/login"); // Redirect to login in other cases
});
