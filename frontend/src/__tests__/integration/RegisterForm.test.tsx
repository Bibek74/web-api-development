import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/_components/RegisterForm";

const mockPush = jest.fn();
const mockSuccess = jest.fn();
const mockError = jest.fn();
const mockHandleRegister = jest.fn();

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
    push: mockPush,
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
  handleRegister: (...args: any[]) => mockHandleRegister(...args),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders registration fields and login link", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("toggles password and confirm password visibility", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;

    expect(passwordInput.type).toBe("password");
    expect(confirmInput.type).toBe("password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    await user.click(screen.getByRole("button", { name: "Show confirm password" }));

    expect(passwordInput.type).toBe("text");
    expect(confirmInput.type).toBe("text");
  });

  it("shows validation error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "different123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(mockHandleRegister).not.toHaveBeenCalled();
  });

  it("submits successfully and routes to /login", async () => {
    const user = userEvent.setup();
    mockHandleRegister.mockResolvedValue({
      success: true,
      message: "ok",
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockSuccess).toHaveBeenCalledWith("Account created successfully!");
    });
  });

  it("shows toast error when register action fails", async () => {
    const user = userEvent.setup();
    mockHandleRegister.mockResolvedValue({
      success: false,
      message: "Email already exists",
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith("Email already exists");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});