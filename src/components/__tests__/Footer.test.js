import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";
import '@testing-library/jest-dom';

describe("Footer Component", () => {
  test("renders EthioMusic logo", () => {
    render(<Footer />);
    expect(screen.getAllByText(/EthioMusic/i).length).toBeGreaterThan(0);
  });

  test("renders follow us section", () => {
    render(<Footer />);
    expect(screen.getByText(/Follow Us/i)).toBeInTheDocument();
  });

  test("renders social icons", () => {
    render(<Footer />);
    expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(4);
  });

  test("renders current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`©\\s*${currentYear}\\s*EthioMusic\\. All rights reserved\\.`, 'i'))
    ).toBeInTheDocument();
  });
});
