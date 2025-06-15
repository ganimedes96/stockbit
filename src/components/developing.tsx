"use client";

import { Construction, Mail, Clock, Wrench } from "lucide-react";
import ImageDevelop from "../assets/developing.png";
import Image from "next/image";

export default function UnderDevelopment() {
  return (
    <div className="flex h-screen  items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Ícones animados */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="animate-bounce">
            <Construction className="w-12 h-12 text-orange-500" />
          </div>
          <div className="animate-bounce delay-100">
            <Wrench className="w-12 h-12 text-blue-500" />
          </div>
          <div className="animate-bounce delay-200">
            <Clock className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Título principal */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            Em Desenvolvimento
          </h1>
          <p className="text-xl md:text-2xl text-amber-100 font-light">
            Estamos trabalhando duro para trazer algo incrível
          </p>
        </div>

        <Image
          src={ImageDevelop}
          alt="Imagem de desenvolvimento"
          className="w-full"
        />
      </div>
    </div>
  );
}
