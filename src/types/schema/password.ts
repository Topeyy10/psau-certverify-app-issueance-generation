export interface LengthRule {
  min: number;
  message: string;
}

export interface RegexRule {
  regex: RegExp;
  message: string;
}

export interface PasswordRules {
  length: LengthRule;
  lowercase: RegexRule;
  uppercase: RegexRule;
  number: RegexRule;
  special: RegexRule;
}
