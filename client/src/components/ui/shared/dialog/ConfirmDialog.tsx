'use client';
import { FC } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from 'src/components/ui/shadcn-ui/alert-dialog';
import LoadingSpinner from 'src/components/ui/shared/LoadingSpinner';
import { cn } from 'src/utils/common.util';

interface IConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  cancelBtnText?: string;
  confirmBtnText?: string;
  cancelBtnClassName?: string;
  confirmBtnClassName?: string;
}

const ConfirmDialog: FC<IConfirmDialogProps> = ({
  title,
  description,
  cancelBtnText,
  cancelBtnClassName,
  confirmBtnText,
  confirmBtnClassName,
  onOpenChange,
  onConfirm,
  open,
  isLoading
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={cn(cancelBtnClassName)}>
            {cancelBtnText || 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(confirmBtnClassName)}
          >
            {isLoading && <LoadingSpinner className="mr-2 size-4" />}
            {confirmBtnText || 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
