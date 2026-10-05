import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'NEW_EMPLOYEE';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  title?: string;
  avatar?: string;
  department?: string;
  employeeId?: string;
  /** Marks whether this is a hardcoded demo account (cannot be deleted) */
  isDemo: boolean;
  /** Company/org slug for multi-tenant support */
  companySlug: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'NEW_EMPLOYEE'],
      default: 'EMPLOYEE',
      index: true,
    },
    title: { type: String },
    avatar: { type: String },
    department: { type: String },
    employeeId: { type: String, sparse: true, index: true },
    isDemo: { type: Boolean, default: false, index: true },
    companySlug: { type: String, default: 'novatech', index: true },
  },
  { timestamps: true }
);

// ─── toJSON transform (strip sensitive fields) ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: any, ret: any) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

// ─── Password helpers ────────────────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const schema = UserSchema as any;
schema.pre('save', async function (this: any, next: () => void) {
  if (!this.isModified('passwordHash')) return next();
  if (this.passwordHash && !String(this.passwordHash).startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

// ─── Model export (singleton safe for Next.js) ───────────────────────────────

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
