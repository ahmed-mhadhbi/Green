const ROLE_LABELS = {
  entrepreneur: "Entrepreneur",
  mentor: "Mentor",
  business_support: "Business Support",
  admin: "Admin"
};

export function getRoleLabel(role, fallback = "Workspace") {
  return ROLE_LABELS[role] || fallback;
}
