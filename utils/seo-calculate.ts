export const getSeoTitleMetric = (title: string) => {
    if (!title)
      return {
        status: "error",
        message: "Seo Title không được để trống",
        score: 0,
      };
    if (title.length < 20)
      return {
        status: "warning",
        message: "Seo Title  không nên có độ dài nhỏ hơn 20 ký tự",
        score: 15,
      };
    if (title.length > 30)
      return {
        status: "success",
        message: `Rất tốt, SEO Title của bạn hiện đang có ${title.length} ký tự. Hãy đảm bảo từ khoá xuất hiện trong SEO Title.`,
        score: 30,
      };
  };
  
  export const getSlugMetric = (aliasUrl: string) => {
    if (!aliasUrl)
      return {
        status: "error",
        message: "URL không được để trống",
        score: 0,
      };
    if (aliasUrl.length < 10)
      return {
        status: "warning",
        message: "Bạn không nên viết URL với độ dài nhỏ hơn 10 ký tự",
        score: 15,
      };
  
    return {
      status: "success",
      message: `Rất tốt, URL của bạn hiện đang có ${aliasUrl.length} ký tự. Hãy đảm bảo từ khoá xuất hiện trong URL.`,
      score: 20,
    };
  };
  
  export const getMetaDescMetric = (metaDescription: string) => {
    if (!metaDescription)
      return {
        status: "error",
        message: "Seo metaDescription không được để trống",
        score: 0,
      };
    if (metaDescription.length < 10) {
      return {
        status: "warning",
        message:
          "Bạn không nên viết Meta Description với độ dài nhỏ hơn 10 ký tự",
        score: 15,
      };
    }
    return {
      status: "success",
      message: `Rất tốt, Meta Description của bạn hiện đang có ${metaDescription.length} ký tự. Hãy đảm bảo từ khoá xuất hiện trong Meta Description.`,
      score: 20,
    };
  };
  
  export const getDescriptionMetric = (description: string) => {
    if (!description) {
      return {
        content: {
          status: "error",
          message: "Nội không được để trống",
          score: 0,
        },
        h2: {
          status: "error",
          message: "Bạn không có thẻ h2 nảo trong nội dung",
          score: 0,
        },
        image: {
          status: "error",
          message: "Bạn không có ảnh nào trong nội dung",
          score: 0,
        },
      };
    }
  
    const h2 = description.match(/<h2/g);
    const image = description.match(/<img/g);
    const parser = new DOMParser();
    const plainText =
      parser.parseFromString(description, "text/html").body.textContent || "";
    const descriptionLength = plainText
      .replaceAll(" ", "")
      .replaceAll(/\s/g, "").length;
    return {
      content: {
        status: descriptionLength
          ? descriptionLength < 1000
            ? "warning"
            : "success"
          : "error",
        message: descriptionLength
          ? descriptionLength < 1000
            ? "Nội dung không nên có độ dài nhỏ hơn 1000 ký tự"
            : ` Rất tốt, Nội dung của bạn hiện đang có ${descriptionLength} ký tự. Hãy đảm bảo từ khoá xuất hiện trong nội dung.`
          : "Nội dung không được để trống",
        score: descriptionLength ? (descriptionLength < 1000 ? 5 : 10) : 0,
      },
      h2: {
        status: h2?.length ? (h2.length <= 3 ? "success" : "warning") : "error",
        message: h2?.length
          ? h2.length <= 3
            ? `Rất tốt, Nội dung của bạn hiện đang chứa ${h2.length} thẻ h2. Hãy đảm bảo từ khoá xuất hiện trong các thẻ h2 này.`
            : "Bạn không nên chèn vượt quá 3 thẻ h2 trong nội dung"
          : "Bạn không có thẻ h2 nào trong nội dung",
        score: h2?.length ? (h2.length <= 3 ? 10 : -5) : 0,
      },
      image: {
        status: image?.length ? "success" : "error",
        message: image?.length
          ? `Rất tốt, bạn có ${image.length} ảnh trong nội dung mang thuộc tính alt.`
          : "Bạn không có hình ảnh nảo trong nội dung",
        score: image?.length ? 10 : 0,
      },
    };
  };
  