'use client';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import React, { FC, useState } from 'react';

import {
  FormControl,
  FormItem,
  FormMessage
} from 'src/components/ui/shadcn-ui/form';
import { Input } from 'src/components/ui/shadcn-ui/input';
import { Label } from 'src/components/ui/shadcn-ui/label';
import { cn } from 'src/utils/common.util';

interface IFormItemInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightLabel?: string | React.ReactNode;
}

const FormItemInput: FC<IFormItemInputProps> = ({
  id,
  type,
  className,
  label,
  rightLabel,
  ...otherProps
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <FormItem>
      {(label || rightLabel) && (
        <div className="flex items-center justify-between">
          {label && <Label htmlFor={id}>{label}</Label>}
          {rightLabel}
        </div>
      )}
      <FormControl>
        <div className="relative">
          <Input
            id={id}
            type={inputType}
            className={cn(type === 'password' && 'pr-10', className)}
            {...otherProps}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOffIcon className="size-4 text-gray-400" />
              ) : (
                <EyeIcon className="size-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </FormControl>
      <FormMessage className="text-red-600" />
    </FormItem>
  );
};

export default FormItemInput;
