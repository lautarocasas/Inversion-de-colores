import { type FC, type JSX } from "react";

interface ImageProps {
    title: string;
    url: string;
}
const Image: FC<ImageProps> = ({title, url}): JSX.Element => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <img src={url} alt="Imagen original" className="rounded shadow" />
    </div>
  );
};

export default Image;
