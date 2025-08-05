import { APIStatus } from "@/client/callAPI";
import {
  createComment,
  deleteComment,
  getComments,
} from "@/client/comment.client";
import FileManagerDialog from "@/components/file-manager/file-manager-dialog";
import ImageCarousel from "@/components/image-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAlert } from "@/store/useAlert";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star, Upload, X } from "lucide-react";
import Image from "next/image";
import { v4 } from "uuid";

export function ProductComments({ productId }: { productId: number }) {
  const { toast } = useToast();
  const { setAlert, closeAlert } = useAlert();
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", productId],
    queryFn: async () => {
      const res = await getComments({ productId });
      if (res.status !== APIStatus.OK) return [];
      return res.data!;
    },
  });

  const form = useForm({
    defaultValues: {
      comments: comments ?? [],
      newComment: {
        rating: 5,
        author: "",
        productId,
        avatar: "",
        images: [] as string[],
        content: "",
      },
      isLoading: false,
    },
  });

  const handleDeleteComment = async (id: string) => {
    const res = await deleteComment([id]);
    if (res.status === APIStatus.OK) {
      form.setFieldValue(
        "comments",
        form.state.values.comments.filter((c) => c._id !== id)
      );
      toast({
        title: "Xóa bình luận thành công",
        description: "Bình luận đã được xóa khỏi hệ thống",
        variant: "success",
      });
    } else {
      toast({
        title: "Xóa bình luận thất bại",
        description: res.message,
        variant: "error",
      });
    }
  };
  const handleAddComment = async () => {
    form.setFieldValue("isLoading", true);
    const res = await createComment(form.state.values.newComment);
    if (res.status === APIStatus.OK && res.data) {
      toast({
        title: "Thêm bình luận thành công",
      });
      form.setFieldValue("comments", [...form.state.values.comments, res.data]);
      form.setFieldValue("newComment", {
        rating: 5,
        author: "",
        productId,
        avatar: "",
        images: [],
        content: "",
      });
    } else {
      toast({
        title: "Thêm bình luận thất bại",
        description: res.message,
        variant: "error",
      });
    }
    form.setFieldValue("isLoading", false);
  };

  if (isLoading) return <div>Loading...</div>;
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">Thêm đánh giá cho sản phẩm</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <form.Field
            name="comments"
            mode="array"
            children={(field) => {
              return field.state.value!.map((comment) => (
                <Card key={comment._id} className="relative col-span-1">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div>
                          <h3 className="font-semibold">{comment.author}</h3>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < comment.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setAlert({
                            title: "Xóa bình luận",
                            description:
                              "Bạn có chắc chắn muốn xóa bình luận này không?",
                            variant: "destructive",
                            onSubmit: () => {
                              handleDeleteComment(comment._id);
                              closeAlert();
                            },
                          })
                        }
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <p className="mt-2">{comment.content}</p>
                    {!!comment.images?.length && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {comment.images.map((image) => (
                          <ImageCarousel
                            key={v4()}
                            images={[image]}
                            className="relative w-20 h-20 max-h-20 max-w-20"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ));
            }}
          />
        </div>
        <form.Field
          name="newComment"
          children={(field) => {
            const newComment = field.state.value;
            return (
              <div className="mt-6 space-y-4">
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        field.handleChange({
                          ...newComment,
                          rating: i + 1,
                        })
                      }
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i < newComment.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="username">Tên tài khoản</Label>
                  <Input
                    id="username"
                    value={newComment.author}
                    onChange={(e) =>
                      field.handleChange({
                        ...newComment,
                        author: e.target.value,
                      })
                    }
                    placeholder="Nhập tên của bạn"
                  />
                </div>
                <div>
                  <Label htmlFor="comment">Nội dung comment</Label>
                  <Textarea
                    id="comment"
                    value={newComment.content}
                    onChange={(e) =>
                      field.handleChange({
                        ...newComment,
                        content: e.target.value,
                      })
                    }
                    placeholder="Nhập đánh giá của bạn"
                  />
                </div>
                <div className="grid grid-cols-6 gap-2">
                  <form.Field
                    name="newComment.images"
                    children={(field) => {
                      return field.state.value.map((image: string) => (
                        <div key={v4()} className="relative group">
                          <Image
                            src={image}
                            alt="comment-image"
                            width={60}
                            height={60}
                            sizes="200px"
                            className="rounded-lg border object-cover w-full aspect-square"
                          />
                          <button
                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm invisible group-hover:visible transition-all"
                            onClick={() =>
                              form.setFieldValue(
                                "newComment.images",
                                field.state.value.filter((i) => i !== image)
                              )
                            }
                          >
                            <X className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      ));
                    }}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <FileManagerDialog
                    onSelect={(images) =>
                      form.setFieldValue("newComment.images", images)
                    }
                  >
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Thêm hình ảnh</span>
                    </Button>
                  </FileManagerDialog>

                  <form.Field
                    name="isLoading"
                    children={(field) => (
                      <Button
                        disabled={field.state.value}
                        onClick={handleAddComment}
                      >
                        {field.state.value && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {field.state.value ? "Đang thêm..." : "THÊM"}
                      </Button>
                    )}
                  />
                </div>
              </div>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
