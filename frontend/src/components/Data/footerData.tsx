import { IconType } from "@tabler/icons-react";
import {
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTelegram,
} from "@tabler/icons-react";

interface Service {
  title: string;
  items: string[];
}

interface SocialLink {
  icon: IconType;
  link: string;
}

export const services: Service[] = [
  {
    title: "System Modules",
    items: [
      "Company Management",
      "Product Configuration",
      "Policy Administration",
      "Claim Management",
      "Commission Management",
      "Bulk Payment Management",
    ],
  },
  {
    title: "Data & Risk",
    items: [
      "NDVI Data Management",
      "Risk Model Build-up",
      "Farm Land Management",
      "Exit & Trigger Points",
      "ELC (Estimated Loss Cost)",
    ],
  },
  {
    title: "Platform Services",
    items: [
      "Dashboard Overview",
      "Reports & Analytics",
      "User Management",
      "Integration APIs",
      "Security & Compliance",
    ],
  },
];

export const socialLinks: SocialLink[] = [
  {
    icon: IconBrandLinkedin,
    link: "https://www.linkedin.com/company/kifiya",
  },
  {
    icon: IconBrandTwitter,
    link: "https://twitter.com/kifiya",
  },
 
  {
    icon: IconBrandYoutube,
    link: "https://www.youtube.com/channel/kifiya",
  },
  {
    icon: IconBrandInstagram,
    link: "https://www.instagram.com/kifiya",
  },
  {
    icon: IconBrandFacebook,
    link: "https://www.facebook.com/kifiya",
  },
  {
    icon: IconBrandTelegram,
    link: "https://t.me/kifiya",
  },
];