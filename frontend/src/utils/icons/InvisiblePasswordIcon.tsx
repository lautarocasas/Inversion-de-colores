import { type IconProps } from "../types";

const InvisiblePasswordIcon = (props: IconProps): JSX.Element => {
  const { fillColor, width, height } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 24}
      height={height || 24}
      fill={fillColor || "#FEFEFE"}
      viewBox="0 0 48 60"
      x="0px"
      y="0px"
    >
      <path
        d="M29.37951,15.4488a17.1032,17.1032,0,0,0-14.34142,1.69645c-5.13732,3.18667-10.765,6.67735-10.765,6.67735a1.49587,1.49587,0,0,0,.01,2.54769l8.80739,5.36758-4.16048,4.1605a1.49491,1.49491,0,1,0,2.11413,2.1141L36.9559,12.10163a1.49526,1.49526,0,1,0-2.11512-2.1141Zm5.55,2.90754-5.58685,5.58781A5.48731,5.48731,0,0,1,22.765,30.52081l-4.11265,4.11262a17.1039,17.1039,0,0,0,14.34043-1.60575C38.0942,29.90982,43.71794,26.472,43.71794,26.472a1.49454,1.49454,0,0,0,.01994-2.53875Zm-9.89486,1.43729a5.48613,5.48613,0,0,0-6.41914,6.41915Z"
        fillRule="evenodd"
        fill={fillColor || "#FEFEFE"}
      />
    </svg>
  );
};

export default InvisiblePasswordIcon;
