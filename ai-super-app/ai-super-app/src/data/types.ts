export type ToolType = "image-upload" | "text-input" | "form-input" | "file-upload";

export interface FormField {
  name: string;
  placeholder: string;
}

export interface Tool {
  id: string;
  nameKey: string;  // i18n key like "tools.daily.wardrobe"
  emoji: string;
  type: ToolType;
  inputLabelKey: string;
  placeholder?: string;
  fields?: FormField[];
  outputLabelKey: string;
  aiPrompt: string;  // prompt template for Claude API
  hasImage?: boolean; // true if this tool generates AI images
}

export interface Bundle {
  id: string;
  emoji: string;
  gradient: string;
  bgLight: string;
  tools: Tool[];
}

export interface Category {
  id: string;
  emoji: string;
  gradient: string;
  bundleIds: string[];
}
