import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SEO } from "@/types/category";
import {
  getDescriptionMetric,
  getMetaDescMetric,
  getSeoTitleMetric,
  getSlugMetric,
} from "@/utils/seo-calculate";
import { AlertTriangle, BarChart, CheckCircle2 } from "lucide-react";

function SeoMetrics({ seo, description }: { seo: Partial<SEO>; description: string }) {
  const { title, slug, description: metaDescription } = seo || {};

  const contentMetrics = getDescriptionMetric(description);
  const parser = new DOMParser();
  const plainText =
    parser.parseFromString(description, "text/html").body.textContent || "";
  const descriptionLength = plainText
    .replaceAll(" ", "")
    .replaceAll(/\s/g, "").length;
  const metrics = [
    {
      label: "Tiêu đề",
      value: title?.length || 0,
      target: "20+",
      ...getSeoTitleMetric(title || ""),
    },
    {
      label: "URL",
      value: slug?.length || 0,
      target: "10+",
      ...getSlugMetric(slug || ""),
    },
    {
      label: "Meta Description",
      value: metaDescription?.length || 0,
      target: "10+",
      ...getMetaDescMetric(metaDescription || ""),
    },
    {
      label: "Nội dung",
      value: descriptionLength,
      target: "1000+",
      ...contentMetrics?.content,
    },
    {
      label: "H2",
      value: description.match(/<h2/g)?.length || 0,
      target: 3,
      ...contentMetrics?.h2,
    },
    {
      label: "Ảnh",
      value: description.match(/<img/g)?.length || 0,
      target: "1+",
      ...contentMetrics?.image,
    },
  ];
  const seoScore = metrics.reduce((acc, metric) => {
    return acc + (metric?.score || 0);
  }, 0);
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <Label>SEO Score</Label>
          </div>
          <Badge variant={seoScore >= 80 ? "outline" : "destructive"}>
            {seoScore}/100
          </Badge>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${
              seoScore >= 80 ? "bg-green-500" : "bg-yellow-500"
            }`}
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </div>
      {metrics.map((metric, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-start gap-2">
            {metric.status === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : metric.status === "warning" ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{metric.label}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "",
                    metric.status === "success"
                      ? ""
                      : metric.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                >
                  {metric.value}/{metric.target}
                </Badge>
              </div>
              <p
                className={`text-sm mt-1 ${
                  metric.status === "success"
                    ? "text-green-600"
                    : metric.status === "warning"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {metric.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default SeoMetrics;
