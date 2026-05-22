export const userWorkspacePath = (user) => {
  const username = user?.user?.username;
  return username ? `/${encodeURIComponent(username)}/workspaces` : "/login";
};
