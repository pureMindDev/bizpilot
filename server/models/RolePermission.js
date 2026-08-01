import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  { view: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
  { _id: false }
);

const rolePermissionSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['Super Admin', 'Support', 'Finance', 'Developer', 'Operations'], required: true, unique: true },
    permissions: {
      type: Map,
      of: permissionSchema,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('RolePermission', rolePermissionSchema);
