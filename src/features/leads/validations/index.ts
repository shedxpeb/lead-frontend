import { z } from 'zod';

export const baseLeadSchema = z.object({
  customerName: z.string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters'),

  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),

  designation: z.string().max(100).optional().or(z.literal('')),
  website: z.string().max(200).optional().or(z.literal('')),

  mobile: z.string()
    .min(10, 'Mobile must be at least 10 digits')
    .max(15, 'Mobile must be at most 15 digits')
    .regex(/^[0-9]+$/, 'Mobile must contain only numbers'),

  email: z.string().min(1, 'Email is required').email('Invalid email address'),

  alternateMobile: z.string().max(20).optional().or(z.literal('')),
  gstNumber: z.string().max(50).optional().or(z.literal('')),
  panNumber: z.string().max(50).optional().or(z.literal('')),

  industry: z.enum([
    'Construction', 'Manufacturing', 'Technology', 'Healthcare',
    'Hospitality', 'Retail', 'Education', 'Finance', 'RealEstate',
    'Infrastructure', 'Energy', 'Mining', 'Agriculture', 'Transportation', 'Logistics', 'Commercial', 'Other',
  ]).optional().or(z.literal('')),

  businessType: z.string().max(100).optional().or(z.literal('')),

  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  area: z.string().max(100).optional().or(z.literal('')),

  city: z.string()
    .max(50, 'City must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  state: z.string()
    .max(50, 'State must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  country: z.string().max(50).optional().or(z.literal('')),

  pincode: z.string()
    .max(10, 'Pincode must be less than 10 characters')
    .optional()
    .or(z.literal('')),

  linkedin: z.string().max(200).optional().or(z.literal('')),
  facebook: z.string().max(200).optional().or(z.literal('')),
  instagram: z.string().max(200).optional().or(z.literal('')),

  profileImage: z.string().optional().or(z.literal('')),
  companyLogo: z.string().optional().or(z.literal('')),

  tags: z.array(z.string()).optional(),

  projectTitle: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(200, 'Project name must be less than 200 characters'),

  projectType: z.enum(['Factory', 'Warehouse', 'IndustrialShed', 'Commercial', 'Residential', 'ColdStorage', 'Other']),

  structureType: z.enum(['PEB', 'SteelStructure', 'Hybrid', 'Other']),

  width: z.union([z.string(), z.number()]).optional(),
  length: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
  baySpacing: z.union([z.string(), z.number()]).optional(),

  roofType: z.enum(['MetalSheet', 'DeckSheet', 'SandwichPanel', 'Other']).optional().or(z.literal('')),
  wallType: z.enum(['MetalSheet', 'BrickWall', 'SandwichPanel', 'Other']).optional().or(z.literal('')),
  materialPreference: z.enum(['Standard', 'Premium', 'Economy']).optional().or(z.literal('')),

  craneRequired: z.boolean().optional(),
  craneCapacity: z.union([z.string(), z.number()]).optional(),
  mezzanine: z.boolean().optional(),
  mezzanineArea: z.union([z.string(), z.number()]).optional(),
  mezzanineLoad: z.union([z.string(), z.number()]).optional(),
  insulationRequired: z.boolean().optional(),
  insulationType: z.string().optional(),
  insulationThickness: z.union([z.string(), z.number()]).optional(),

  source: z.enum(['Website', 'Referral', 'ColdCall', 'Email', 'SocialMedia', 'TradeShow', 'Advertisement', 'Other']),

  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),

  status: z.enum([
    'New', 'Contacted', 'DesignPending', 'BOQPending',
    'EstimateSent', 'ProposalSent', 'Negotiation',
    'Approved', 'Rejected', 'Converted',
  ]).optional().default('New'),

  nextFollowUpDate: z.any().optional(),

  siteLocation: z.string().optional().or(z.literal('')),
  siteAddress: z.string().optional().or(z.literal('')),
  mapCoordinates: z.string().optional().or(z.literal('')),
  soilNotes: z.string().optional().or(z.literal('')),
  customerNotes: z.string().optional().or(z.literal('')),
  specialRequirement: z.string().optional().or(z.literal('')),
  customFields: z.record(z.string(), z.any()).optional(),
});

const leadRefinements = (data: any, ctx: z.RefinementCtx) => {
  if (data.craneRequired === true) {
    if (data.craneCapacity === undefined || data.craneCapacity === null || isNaN(data.craneCapacity)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Crane capacity is required when crane is required',
        path: ['craneCapacity'],
      });
    } else if (data.craneCapacity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Crane capacity must be positive',
        path: ['craneCapacity'],
      });
    }
  }

  if (data.mezzanine === true) {
    if (data.mezzanineArea === undefined || data.mezzanineArea === null || isNaN(data.mezzanineArea)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mezzanine area is required when mezzanine is yes',
        path: ['mezzanineArea'],
      });
    } else if (data.mezzanineArea <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mezzanine area must be positive',
        path: ['mezzanineArea'],
      });
    }

    if (data.mezzanineLoad === undefined || data.mezzanineLoad === null || isNaN(data.mezzanineLoad)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mezzanine load is required when mezzanine is yes',
        path: ['mezzanineLoad'],
      });
    } else if (data.mezzanineLoad <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mezzanine load must be positive',
        path: ['mezzanineLoad'],
      });
    }
  }

  if (data.insulationRequired === true) {
    if (!data.insulationType || data.insulationType.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Insulation type is required when insulation is required',
        path: ['insulationType'],
      });
    }

    if (data.insulationThickness === undefined || data.insulationThickness === null || isNaN(data.insulationThickness)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Insulation thickness is required when insulation is required',
        path: ['insulationThickness'],
      });
    } else if (data.insulationThickness <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Insulation thickness must be positive',
        path: ['insulationThickness'],
      });
    }
  }
};

export const createLeadSchema = baseLeadSchema.superRefine(leadRefinements);

export const updateLeadSchema = baseLeadSchema.partial().superRefine(leadRefinements);

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;
