import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/app/(navigation)/ThemeToggle";

const mockUseTheme = jest.fn();
const mockToggleTheme = jest.fn();

jest.mock("@/lib/theme", () => ({
  useTheme: () => mockUseTheme(),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows fallback icon and label before mounted", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      mounted: false,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("◐");
  });

  it("shows sun icon for dark mode and toggles theme on click", async () => {
    const user = userEvent.setup();
    mockUseTheme.mockReturnValue({
      theme: "dark",
      mounted: true,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to light mode" });
    expect(button).toHaveTextContent("☀️");

    await user.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("shows moon icon for light mode", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      mounted: true,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to dark mode" });
    expect(button).toHaveTextContent("🌙");
  });
});