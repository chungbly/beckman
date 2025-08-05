"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Gift, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";

export function ProductGifts({
  gifts,
  onChange,
}: {
  gifts: string[];
  onChange: (gifst: string[]) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newGiftName, setNewGiftName] = useState("");

  const handleAdd = () => {
    if (newGiftName.trim()) {
      onChange([...gifts, newGiftName.trim()]);
      setNewGiftName("");
      setIsAdding(false);
    }
  };

  const handleEdit = (gift: string, index: number) => {
    setEditingId(index);
    setNewGiftName(gift);
  };

  const handleSaveEdit = (index: number) => {
    if (newGiftName.trim()) {
      onChange(
        gifts.map((gift, idx) => (idx === index ? newGiftName.trim() : gift))
      );
      setEditingId(null);
      setNewGiftName("");
    }
  };

  const handleDelete = (id: number) => {
    onChange(gifts.filter((_, index) => index !== id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Quà tặng đi kèm
        </CardTitle>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add gift</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {isAdding && (
          <div className="flex items-center gap-2">
            <Input
              value={newGiftName}
              onChange={(e) => setNewGiftName(e.target.value)}
              placeholder="Nhập tên quà tặng"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdd}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Save gift</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewGiftName("");
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        )}
        {gifts.map((gift, index) => (
          <div key={gift} className="flex items-center justify-between py-2">
            {editingId === index ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={newGiftName}
                  onChange={(e) => setNewGiftName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveEdit(index)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Save edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(null);
                    setNewGiftName("");
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel edit</span>
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1">{gift}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(gift, index)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit gift</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Delete gift</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
