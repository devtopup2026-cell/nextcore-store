import type { Product } from "../../types/product";

export const vgaProducts: Product[] = [
{
  id:2001,

  slug:"asus-rtx-5070",

  sku:"RTX5070-TUF-12GB",

  name:"RTX 5070",

  brand:"ASUS",

  category:"VGA",

  shortDescription:"ASUS TUF Gaming RTX 5070",

  description:
    "การ์ดจอ NVIDIA RTX5070 รองรับ DLSS4 และ Ray Tracing รุ่นใหม่ เหมาะสำหรับ Gaming และ AI",

  image:"/products/rtx5070.jpg",

  thumbnail:"/products/rtx5070.jpg",

  images:[
      "/products/rtx5070.jpg",
      "/products/rtx5070-2.jpg",
      "/products/rtx5070-3.jpg",
      "/products/rtx5070-4.jpg",
  ],

  price:24900,

  compareAtPrice:26900,

  stock:12,

  rating:4.9,

  reviewCount:128,

  featured:true,

  isNew:true,

  warranty:"3 Years",

  specifications:[

      {
        label:"GPU",
        value:"RTX5070"
      },

      {
        label:"Memory",
        value:"12GB GDDR7"
      },

      {
        label:"Boost Clock",
        value:"2610 MHz"
      },

      {
        label:"Power Supply",
        value:"650W"
      }

  ]

},
];