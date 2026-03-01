import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/_components/LoginForm";

const mockReplace = jest.fn();
const mockSuccess = jest.fn();
const mockError = jest.fn();
const mockHandleLogin = jest.fn();

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
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@/lib/toast", () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
    info: jest.fn(),
    confirm: jest.fn(),
  }),
}));

jest.mock("@/lib/actions/auth-actions", () => ({
  handleLogin: (...args: any[]) => mockHandleLogin(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login inputs, button and links", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/register");
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const toggleBtn = screen.getByRole("button", { name: "Show password" });

    expect(passwordInput.type).toBe("password");
    await user.click(toggleBtn);
    expect(passwordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument();
    expect(await screen.findByText("Password must be at least 6 characters")).toBeInTheDocument();
    expect(mockHandleLogin).not.toHaveBeenCalled();
  });

  it("submits and redirects admin user to /admin", async () => {
    const user = userEvent.setup();
    mockHandleLogin.mockResolvedValue({
      success: true,
      message: "ok",
      data: { role: "admin" },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "password123",
      });
      expect(mockSuccess).toHaveBeenCalledWith("Login successful!");
      expect(mockReplace).toHaveBeenCalledWith("/admin");
    });
  });

  it("submits and redirects non-admin user to /home", async () => {
    const user = userEvent.setup();
    mockHandleLogin.mockResolvedValue({
      success: true,
      message: "ok",
      data: { role: "user" },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("shows toast error on failed login", async () => {
    const user = userEvent.setup();
    mockHandleLogin.mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith("Invalid credentials");
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});