"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Camera,
  Cat as CatIcon,
  Eye,
  Heart,
  MapPin,
  Palette,
  Shield,
  Share2,
} from "lucide-react";

type Classification = {
  isCat: boolean;
  title?: string;
  breed?: string;
  color?: string;
  pattern?: string;
  bodyType?: string;
  eyeColor?: string;
  pose?: string;
  sceneDescription?: string;
};

type LocationData = {
  city?: string;
  country?: string;
};

interface CatNftCardProps {
  classification: Classification;
  location?: LocationData;
  imageUrl?: string | null;
  likesCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  actions?: React.ReactNode; // Rendered below description
}

export function CatNftCard({
  classification,
  location,
  imageUrl,
  likesCount = 0,
  isLiked = false,
  onLike,
  onShare,
  actions,
}: CatNftCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative">
        <div className="relative bg-muted aspect-square overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={classification.title || "Cat"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex gap-2">
            {onLike && (
              <Button
                onClick={onLike}
                variant={isLiked ? "default" : "secondary"}
                size="sm"
                className={`shadow-lg backdrop-blur-sm ${
                  isLiked
                    ? "bg-white/90 hover:bg-white text-gray-900"
                    : "bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900"
                }`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current text-red-500" : "text-gray-600"}`} />
                {likesCount}
              </Button>
            )}
            {onShare && (
              <Button onClick={onShare} variant="secondary" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {classification.title && (
        <div className="p-4">
          <h2 className="text-2xl font-bold text-center">{classification.title}</h2>
        </div>
      )}

      {classification.sceneDescription && (
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground text-center">
            {classification.sceneDescription}
          </p>
        </div>
      )}

      {actions && (
        <div className="px-4 pb-4 flex items-center justify-center gap-3">
          {actions}
        </div>
      )}

      <div className="p-4">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" /> Attributes
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <CatIcon className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">Breed</span>
            </div>
            <p className="text-sm font-medium">{classification.breed || "Unknown"}</p>
          </div>

          <div className="border rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">Color</span>
            </div>
            <p className="text-sm font-medium">{classification.color || "Unknown"}</p>
          </div>

          {location && (
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">Location</span>
              </div>
              <p className="text-sm font-medium">
                {location.city || location.country || "GPS Verified"}
              </p>
            </div>
          )}

          {classification.pattern && (
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">Pattern</span>
              </div>
              <p className="text-sm font-medium">{classification.pattern}</p>
            </div>
          )}

          {classification.bodyType && (
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">Build</span>
              </div>
              <p className="text-sm font-medium">{classification.bodyType}</p>
            </div>
          )}

          {classification.eyeColor && (
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">Eyes</span>
              </div>
              <p className="text-sm font-medium">{classification.eyeColor}</p>
            </div>
          )}

          {classification.pose && (
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">Pose</span>
              </div>
              <p className="text-sm font-medium">{classification.pose}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


