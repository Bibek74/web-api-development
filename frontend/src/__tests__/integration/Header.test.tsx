import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/app/(navigation)/Header";

const mockPush = jest.fn();
const mockConfirm = jest.fn();
const mockClearSessionCookies = jest.fn();
const mockGetSessionUser = jest.fn();
const mockUsePathname = jest.fn();

jest.mock("next/image", () => {
  return function MockImage(props: any) {
    const { priority, ...rest } = props;
    return <img {...rest} alt={props.alt || "image"} />;
  };
});

jest.mock("next/link", () => {
  return function MockLink({ href, children, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockUsePathname(),
}));

jest.mock("@/lib/toast", () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    confirm: (...args: any[]) => mockConfirm(...args),
  }),
}));

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
  buildProfileImageUrl: jest.fn(() => ""),
  clearSessionCookies: () => mockClearSessionCookies(),
}));

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/home");
  });

  it("renders auth links for logged out state", () => {
    mockGetSessionUser.mockReturnValue(null);

    render(<Header />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/register");
    expect(screen.queryByText(/Welcome,/i)).not.toBeInTheDocument();
  });

  it("renders logged-in state for normal user", () => {
    mockGetSessionUser.mockReturnValue({
      _id: "u1",
      name: "Normal User",
      email: "normal@example.com",
      role: "user",
    });

    render(<Header />);

    expect(screen.getByText("Welcome, Normal User")).toBeInTheDocument();
    expect(screen.getByTitle("My Profile")).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("uses admin profile link for admin user", () => {
    mockGetSessionUser.mockReturnValue({
      _id: "a1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    });

    render(<Header />);

    expect(screen.getByTitle("My Profile")).toHaveAttribute("href", "/admin");
  });

  it("logs out when confirmation succeeds", async () => {
    const user = userEvent.setup();
    mockGetSessionUser.mockReturnValue({
      _id: "u1",
      name: "Normal User",
      email: "normal@example.com",
      role: "user",
    });
    mockConfirm.mockResolvedValue(true);

    render(<Header />);
    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to log out?", "Logout");
      expect(mockClearSessionCookies).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("does not log out when confirmation is canceled", async () => {
    const user = userEvent.setup();
    mockGetSessionUser.mockReturnValue({
      _id: "u1",
      name: "Normal User",
      email: "normal@example.com",
      role: "user",
    });
    mockConfirm.mockResolvedValue(false);

    render(<Header />);
    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockClearSessionCookies).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});