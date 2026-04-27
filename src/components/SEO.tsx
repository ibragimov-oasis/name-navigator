import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
}

/**
 * Lightweight SEO updater — sets <title> and <meta> without external deps.
 * Reverts on unmount to avoid leaking state across routes.
 */
const SEO = ({ title, description, canonical, image, type = "website" }: SEOProps) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [k, v] = selector.replace(/[\[\]"]/g, "").split("=");
        el.setAttribute(k, v);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
      return el;
    };

    const created: HTMLElement[] = [];
    if (description) setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    if (description) setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", type);
    if (image) setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", title);
    if (description) setMeta('meta[name="twitter:description"]', "content", description);

    // canonical
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
      created.push(link);
    }
    link.setAttribute(
      "href",
      canonical || (typeof window !== "undefined" ? window.location.href.split("?")[0] : "/")
    );

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.parentElement?.removeChild(el));
    };
  }, [title, description, canonical, image, type]);

  return null;
};

export default SEO;
