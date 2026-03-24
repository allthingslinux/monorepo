"use client";

import { useTranslations } from "next-intl";

/**
 * Hook that maps next-intl translations to Better Auth UI localization format
 * This converts our locale structure to Better Auth UI's expected format
 *
 * All Better Auth UI components will use these translated strings automatically
 * when this hook is used in the AuthUIProviderTanstack localization prop
 */
export function useBetterAuthUILocalization(): Record<string, string> {
  const t = useTranslations();
  return {
    ACCOUNT: t("account.account"),
    ACTIVE_SESSIONS: t("account.activeSessions"),
    // API Keys
    API_KEYS: t("account.apiKeys"),
    BACK: t("common.back"),
    CANCEL: t("common.cancel"),
    CHANGE_PASSWORD: t("account.changePassword"),
    CHANGE_PASSWORD_SUCCESS: t("auth.changePasswordSuccess"),
    CLOSE: t("common.close"),
    CONFIRM_PASSWORD_PLACEHOLDER: t("auth.confirmPasswordPlaceholder"),
    // Buttons and actions
    CONTINUE: t("common.continue"),
    CREATE_API_KEY: t("account.createApiKey"),
    CREATE_PASSKEY: t("account.createPasskey"),
    DELETE: t("common.delete"),
    DELETE_ACCOUNT: t("account.deleteAccount"),

    DELETE_ACCOUNT_SUCCESS: t("auth.deleteAccountSuccess"),
    EDIT: t("common.edit"),
    // Form fields
    EMAIL_PLACEHOLDER: t("auth.emailPlaceholder"),
    ERROR: t("common.error"),
    FORGOT_PASSWORD: t("auth.forgotPassword"),

    FORGOT_PASSWORD_EMAIL: t("auth.forgotPasswordEmail"),
    // OAuth/Providers
    LINK_ACCOUNT: t("account.linkAccount"),
    LOADING: t("common.loading"),
    MAGIC_LINK: t("auth.magicLink"),
    MAGIC_LINK_DESCRIPTION: t("auth.magicLinkDescription"),
    // Messages
    MAGIC_LINK_EMAIL: t("auth.magicLinkEmail"),
    NAME_PLACEHOLDER: t("auth.namePlaceholder"),
    NEXT: t("common.next"),
    OPTIONAL_BRACKETS: t("account.optionalBrackets"),
    // Passkeys
    PASSKEYS: t("account.passkeys"),

    PASSWORD_PLACEHOLDER: t("auth.passwordPlaceholder"),
    PREVIOUS: t("common.previous"),
    PROFILE: t("account.profile"),
    RECOVER_ACCOUNT: t("auth.recoverAccount"),
    RECOVER_ACCOUNT_DESCRIPTION: t("auth.recoverAccountDescription"),

    RESET_PASSWORD: t("auth.resetPassword"),
    RESET_PASSWORD_SUCCESS: t("auth.resetPasswordSuccess"),
    RETRY: t("common.retry"),
    SAVE: t("common.save"),

    SECURITY: t("account.security"),
    SEND_VERIFICATION_CODE: t("account.sendVerificationCode"),
    // Sessions
    SESSIONS: t("account.sessions"),
    SET_PASSWORD_DESCRIPTION: t("account.setPasswordDescription"),
    // Account settings
    SETTINGS: t("account.settings"),
    // Authentication views
    SIGN_IN: t("auth.signIn"),
    SIGN_IN_DESCRIPTION: t("auth.signInDescription"),
    SIGN_IN_USERNAME_PLACEHOLDER: t("account.signInUsernamePlaceholder"),
    SIGN_OUT: t("auth.signOut"),

    SIGN_OUT_DESCRIPTION: t("auth.signOutDescription"),
    SIGN_UP: t("auth.signUp"),
    SIGN_UP_DESCRIPTION: t("auth.createAccount"),

    SUBMIT: t("common.submit"),
    SWITCH_ACCOUNT: t("account.switchAccount"),

    TRUST_DEVICE: t("account.trustDevice"),
    TWO_FACTOR: t("auth.twoFactor"),
    TWO_FACTOR_ACTION: t("account.twoFactorAction"),
    TWO_FACTOR_CARD_DESCRIPTION: t("account.twoFactorCardDescription"),
    TWO_FACTOR_DESCRIPTION: t("auth.completeTwoFactor"),
    TWO_FACTOR_DISABLED: t("account.twoFactorDisabled"),
    TWO_FACTOR_DISABLE_INSTRUCTIONS: t("account.twoFactorDisableInstructions"),
    TWO_FACTOR_ENABLE_INSTRUCTIONS: t("account.twoFactorEnableInstructions"),
    // Two-factor authentication
    TWO_FACTOR_ENABLED: t("account.twoFactorEnabled"),

    TWO_FACTOR_PROMPT: t("account.twoFactorPrompt"),
    TWO_FACTOR_TOTP_LABEL: t("account.twoFactorTotpLabel"),
    UNLINK: t("account.unlink"),
    UPDATE_AVATAR: t("account.updateAvatar"),
    UPDATE_EMAIL: t("account.updateEmail"),

    // Profile
    UPDATE_NAME: t("account.updateName"),
    UPDATE_USERNAME: t("account.updateUsername"),

    // General
    UPDATED_SUCCESSFULLY: t("account.updatedSuccessfully"),
    // Additional fields
    USERNAME: t("account.username"),
    USERNAME_DESCRIPTION: t("account.usernameDescription"),
    USERNAME_INSTRUCTIONS: t("account.usernameInstructions"),
    USERNAME_PLACEHOLDER: t("auth.usernamePlaceholder"),
  };
}