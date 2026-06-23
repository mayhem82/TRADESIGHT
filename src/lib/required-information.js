export const REQUIRED_INFORMATION = {
  compliance: ['Location', 'Building class if known', 'Description of work', 'Who will perform the work', 'Photos, plans, or measurements'],
  defect: ['Photos of the defect', 'When the issue appeared', 'Who performed the work', 'Contract, invoice, or report', 'Current safety concern'],
  plan: ['Plan, sketch, or drawing', 'Site location', 'Building class if known', 'Intended work', 'Known council or certifier requirements'],
  dispute: ['What happened', 'Who is involved', 'Timeline', 'Contract or written agreement', 'Photos, invoices, reports, or messages'],
  materials: ['Material or product name', 'Application area', 'Exposure conditions', 'Manufacturer information', 'Relevant measurements'],
  safety: ['Hazard description', 'Location', 'Photos', 'Who may be exposed', 'Urgency'],
  government: ['Responsible body', 'Decision or failure being reviewed', 'Timeline', 'Rules or policy involved', 'Evidence already held'],
  unknown: ['Describe the issue in plain language', 'Location', 'Photos or files', 'What outcome is needed']
};

export function getRequiredInformation(type = 'unknown') {
  return REQUIRED_INFORMATION[type] || REQUIRED_INFORMATION.unknown;
}
