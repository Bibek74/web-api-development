import { render, screen } from "@testing-library/react";
import Footer from "@/app/(navigation)/Footer";

const mockGetSessionUser = jest.fn();

jest.mock("next/link", () => {
  return function MockLink({ href, children, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("@/lib/theme", () => ({
  useTheme: () => ({
    theme: "light",
    mounted: true,
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

jest.mock("@/lib/user-session", () => ({
  getSessionUser: () => mockGetSessionUser(),
  onSessionUserUpdate: () => jest.fn(),
}));

describe("Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });

  it("shows Join community and Sign in when logged out", () => {
    mockGetSessionUser.mockReturnValue(null);

    render(<Footer />);

    expect(screen.getByRole("link", { name: "Join community" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("hides Join community and Sign in when session user exists", () => {
    mockGetSessionUser.mockReturnValue({
      _id: "u1",
      name: "Logged User",
      email: "user@example.com",
      role: "user",
    });

    render(<Footer />);

    expect(screen.queryByRole("link", { name: "Join community" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("hides Join community and Sign in when auth cookie exists", () => {
    mockGetSessionUser.mockReturnValue(null);
    document.cookie = "auth_token=fake-token; path=/";

    render(<Footer />);

    expect(screen.queryByRole("link", { name: "Join community" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });
});