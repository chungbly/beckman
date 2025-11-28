"use client";

import { APIStatus } from "@/client/callAPI";
import { updateConfig } from "@/client/configs.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { IconBrandTiktok } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import {
  Clock,
  Edit2,
  Facebook,
  InstagramIcon,
  LinkedinIcon,
  LinkIcon,
  MapPin,
  MapPinned,
  Phone,
  Plus,
  Save,
  TwitterIcon,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { v4 } from "uuid";
import { getSociaLinkIcon } from "./utils";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface Location {
  name: string;
  address: string;
  openHours: string;
  phoneNumber: string;
  map: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon?: React.ReactNode;
}

export interface Contact {
  locations: Location[];
  socialLinks: SocialLink[];
  description: string;
}


export default function ContactInfo({
  configs,
}: {
  configs: Record<string, any>;
}) {
  const { toast } = useToast();
  const contact = configs["CONTACTS"] as Contact;
  const form = useForm({
    defaultValues: {
      locations: contact.locations || ([] as Location[]),
      socialLinks: contact.socialLinks || ([] as SocialLink[]),
      description: contact.description || "",
    },
    onSubmit: async ({ value }) => {
      const res = await updateConfig("CONTACTS", JSON.stringify(value));
      if (res.status !== APIStatus.OK) {
        toast({
          title: "Lỗi",
          description: res.message,
          variant: "error",
        });
      } else {
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin liên hệ thành công",
        });
      }
    },
  });

  const locationForm = useForm({
    defaultValues: {
      name: "",
      address: "",
      openHours: "",
      phoneNumber: "",
      map: "",
    },
  });

  const socialLinkForm = useForm({
    defaultValues: {
      name: "",
      url: "",
    },
  });

  return (
    <div className="p-6 space-y-8 w-full">
      <PageBreadCrumb breadcrumbs={[{ name: "Thông tin liên hệ" }]} />

      <div className="flex w-full items-center justify-between my-4">
        <h1 className="text-3xl font-bold tracking-tight">Thông tin liên hệ</h1>
        <Button onClick={form.handleSubmit}>
          <Save className="h-4 w-4 mr-2" /> Lưu
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Store Locations */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Địa chỉ cửa hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* @ts-ignore */}
            <form.Field name="locations">
              {(field) => {
                // @ts-ignore
                const locations = field.state.value as Location[];
                return (
                  <div>
                    {locations.map((location, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <h3 className="font-medium">
                                {location.name} - {location.address}
                              </h3>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog modal={false}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent forceMount>
                                <DialogHeader>
                                  <DialogTitle>Chỉnh sửa Location</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <form.Field
                                    name={`locations[${i}].name`}
                                    children={(subField) => (
                                      <Input
                                        placeholder="Tên cửa hàng"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.handleChange(e.target.value)
                                        }
                                      />
                                    )}
                                  />
                                  <form.Field
                                    name={`locations[${i}].address`}
                                    children={(subField) => (
                                      <Input
                                        placeholder="Địa chỉ"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.handleChange(e.target.value)
                                        }
                                      />
                                    )}
                                  />
                                  <form.Field
                                    name={`locations[${i}].openHours`}
                                    children={(subField) => (
                                      <Input
                                        placeholder="Giờ mở cửa"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.handleChange(e.target.value)
                                        }
                                      />
                                    )}
                                  />
                                  <form.Field
                                    name={`locations[${i}].phoneNumber`}
                                    children={(subField) => (
                                      <Input
                                        placeholder="Số điện thoại"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.handleChange(e.target.value)
                                        }
                                      />
                                    )}
                                  />
                                  <form.Field
                                    name={`locations[${i}].map`}
                                    children={(subField) => (
                                      <Input
                                        placeholder="Địa chỉ google map"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.handleChange(e.target.value)
                                        }
                                      />
                                    )}
                                  />
                                </div>
                                <DialogFooter>
                                  <DialogClose className="w-full">
                                    <Button className="w-full">OK</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => field.removeValue(i)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="text-sm">{location.openHours}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary" />
                          <a
                            href={`tel:${location.phoneNumber}`}
                            className="text-sm hover:text-primary transition-colors"
                          >
                            {location.phoneNumber}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPinned className="h-5 w-5 text-primary" />
                          <a
                            href={location.map}
                            className="text-sm hover:text-primary transition-colors"
                          >
                            {location.map}
                          </a>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                );
              }}
            </form.Field>

            {/* Add new location form */}
            <div className="space-y-4">
              <locationForm.Field
                name="name"
                children={(field) => (
                  <Input
                    placeholder="Tên cửa hàng"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
              <locationForm.Field
                name="address"
                children={(field) => (
                  <Input
                    placeholder="Địa chỉ"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
              <locationForm.Field
                name="openHours"
                children={(field) => (
                  <Input
                    placeholder="Thời gian mở cửa"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
              <locationForm.Field
                name="phoneNumber"
                children={(field) => (
                  <Input
                    placeholder="Số điện thoại"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
              <locationForm.Field
                name="map"
                children={(field) => (
                  <Input
                    placeholder="Địa chỉ google map"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />

              <Button
                onClick={() => {
                  form.setFieldValue("locations", [
                    ...form.state.values.locations,
                    locationForm.state.values,
                  ]);
                  locationForm.reset();
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Thêm địa chỉ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Connect With Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field name="socialLinks" mode="array">
              {(field) => {
                // @ts-ignore
                const socialLinks = field.state.value as SocialLink[];
                return socialLinks.map((link, index) => (
                  <div key={v4()} className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSociaLinkIcon(link.name)}
                        <span>{link.name}</span>
                      </a>
                    </Button>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Chỉnh sửa liên kết mạng xã hội
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <form.Field
                              name={`socialLinks[${index}].name`}
                              children={(field) => (
                                <Input
                                  placeholder="Tên mạng xã hội"
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              )}
                            />
                            <form.Field
                              name={`socialLinks[${index}].url`}
                              children={(field) => (
                                <Input
                                  placeholder="Liên kết mạng xã hội"
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              )}
                            />
                          </div>
                          <DialogFooter>
                            <Button className="w-full">OK</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => field.removeValue(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ));
              }}
            </form.Field>

            {/* Add new social link form */}
            <div className="space-y-4">
              {/* @ts-ignore */}
              <socialLinkForm.Field
                name="name"
                children={(field) => (
                  <Input
                    placeholder="Tên mạng xã hội"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />
              <socialLinkForm.Field
                name="url"
                children={(field) => (
                  <Input
                    placeholder="Liên kết mạng xã hội"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              />

              <Button
                onClick={() => {
                  form.setFieldValue("socialLinks", [
                    ...form.state.values.socialLinks,
                    socialLinkForm.state.values,
                  ]);
                  socialLinkForm.reset();
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Thêm mạng xã hội
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description Input */}
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Page Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* @ts-ignore */}
          <form.Field
            name="description"
            children={(field) => (
              <JoditEditor
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
