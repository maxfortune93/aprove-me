"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar exclusão",
  message = "Tem certeza que deseja excluir este item?",
  itemName,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white-900">
                  {title}
                </CardTitle>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base text-white-700">
            {message}
            {itemName && (
              <span className="font-semibold text-gray-900"> {itemName}</span>
            )}?
          </CardDescription>
          <p className="text-sm text-white-500">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="flex-1"
            >
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

