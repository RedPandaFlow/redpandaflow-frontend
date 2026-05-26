export const userWorkspacePath = (user) => {
  const username = user?.username;
  return username ? `/${encodeURIComponent(username)}/workspaces` : "/login";
};
