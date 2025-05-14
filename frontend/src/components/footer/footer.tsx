"use client";
// import type { Element as JSXElement } from 'react';

import { Grid, Text, List } from "@mantine/core";
import { IconBrandLinkedin, IconBrandTwitter, IconBrandGithub } from "@tabler/icons-react";

import { services, socialLinks } from "@/components/Data/footerData";

import Image from 'next/image';

export default function Footer(): JSXElement {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#ffffff10] w-full">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Grid gutter={50} className="items-start">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Grid className="flex flex-col items-center lg:items-start">
              {services.map((service, index) => (
                <Grid.Col
                  key={index}
                  span={{ base: 12, md: 4 }}
                  className="text-center lg:text-left"
                >
                  <p
                    style={{ color: "#FFFFFF" }}
                    className="font-semibold text-lg uppercase tracking-wide mb-4"
                  >
                    {service.title}
                  </p>
                  <List spacing="xs" center>
                    {service.items.map((item, idx) => (
                      <List.Item
                        key={idx}
                        className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer"
                      >
                        {item}
                      </List.Item>
                    ))}
                  </List>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }} className="lg:flex lg:justify-end">
            <div className="relative h-40 w-full lg:w-[400px] rounded-xl overflow-hidden border-2 border-cultural-red/20">
              <div className="object-cover hover:scale-105 transition-transform">
                <Image
                  src="/assets/mis_footer_image.jpg"
                  alt="MIS System Dashboard"
                  fill
                />
              </div>
            </div>
          </Grid.Col>
        </Grid>

        <hr className="my-12 border-[#ffffff10] w-full" />

        <div className="h-20">
          <div className="flex justify-center mb-8">
            <Text className="text-3xl font-bold text-white tracking-tighter">
              <span className="text-white">Management</span>
              <span className="text-cultural-red"> Information System</span>
            </Text>
          </div>

          <div className="flex justify-center gap-6">
            {socialLinks.map(({ icon: Icon, link }, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#ffffff10] flex items-center justify-center hover:bg-cultural-red transition-all duration-300"
              >
                <Icon size={24} className="text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black py-4 w-full mx-auto text-center">
        <span className="text-center text-sm text-white">
          {new Date().getFullYear()} Management Information System. All rights reserved. |
          <a href="/privacy" className="ml-1 underline hover:text-cultural-red">
            Privacy Policy
          </a>{" "}
          |
          <a href="/terms" className="ml-1 underline hover:text-cultural-red">
            Terms of Service
          </a>
        </span>
      </div>
    </footer>
  );
}