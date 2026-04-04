# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-04-04

### Added
- **User Management & Role-Based Access Control (RBAC):**
  - Admins can now create new users, delete users, and change user roles from the new "User Management" tab inside the Settings page.
  - Three distinct roles are now supported: `Admin`, `Accountant`, and `Receptionist`.
  - Sidebar navigation links dynamically update based on the logged-in user's role.
  - Role-restricted routing added to prevent unauthorized users from accessing financial or settings pages.
  - The side menu now elegantly displays the current user's name and role badge.
- **First-Time Setup Helper:** Added a helpful UI hint to the login screen providing default credentials for a freshly installed database (`admin@aadharshila.local` with temp password).

### Changed
- Refactored `Settings` page into tabs for better organization: "School Info" and "User Management".
- Application now packages into the `releases/v1.1.0` folder keeping old builds archived.

## [1.0.0] - 2026-03-27

### Added
- Initial Electron desktop application bundle.
- Windows Installer generation via electron-builder.
- Local SQLite database integrated into AppData for cross-installation persistence.
- Complete backend running on localhost:3001 within the Electron App.
- Core Fee Management functionality: Students, Fee Structure, Ledger, Payments. 
