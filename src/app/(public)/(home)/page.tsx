"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  BarChart3,
  Shield,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">StockBit</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#recursos"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Recursos
            </a>
            <a
              href="#precos"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Preços
            </a>
            <a
              href="#sobre"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Sobre
            </a>
            <a
              href="#contato"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contato
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">Entrar</Link>
            <Button>
              <Link href="/login">Começar Grátis</Link>
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a
                href="#recursos"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Recursos
              </a>
              <a
                href="#precos"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Preços
              </a>
              <a
                href="#sobre"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Sobre
              </a>
              <a
                href="#contato"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Contato
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Link href={"/login"} className="justify-start">
                  Entrar
                </Link>
              </div>
              <Button className="justify-start">Começar Grátis</Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 Novo: Relatórios com IA
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Controle Total do seu <span className="text-primary">Estoque</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie produtos, controle entradas e saídas, e tenha relatórios
            completos do seu inventário em tempo real. Simplifique sua gestão
            com a plataforma mais completa do mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8">
              Começar Grátis por 14 dias
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver Demonstração
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Configuração em 5 minutos
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Suporte 24/7
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: "Gestão Completa de Produtos",
      description:
        "Cadastre, organize e categorize seus produtos com facilidade. Controle códigos, descrições, preços e fornecedores.",
    },
    {
      icon: BarChart3,
      title: "Relatórios Inteligentes",
      description:
        "Dashboards em tempo real com insights sobre vendas, estoque baixo, produtos mais vendidos e análises de tendências.",
    },
    {
      icon: TrendingUp,
      title: "Controle de Movimentação",
      description:
        "Registre entradas e saídas automaticamente. Histórico completo de todas as movimentações do seu estoque.",
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description:
        "Seus dados protegidos com criptografia de ponta. Backups automáticos e controle de acesso por usuário.",
    },
    {
      icon: Clock,
      title: "Alertas Automáticos",
      description:
        "Receba notificações quando produtos estiverem com estoque baixo ou próximos ao vencimento.",
    },
    {
      icon: Users,
      title: "Multi-usuário",
      description:
        "Equipe colaborativa com diferentes níveis de permissão. Controle quem pode ver e editar informações.",
    },
  ];

  return (
    <section id="recursos" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Recursos que Transformam sua Gestão
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para ter controle total do seu estoque em uma
            única plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Básico",
      price: "R$ 49",
      period: "/mês",
      description: "Ideal para pequenas empresas",
      features: [
        "Até 1.000 produtos",
        "2 usuários",
        "Relatórios básicos",
        "Suporte por email",
        "Backup diário",
        "App mobile",
      ],
      popular: false,
    },
    {
      name: "Profissional",
      price: "R$ 99",
      period: "/mês",
      description: "Para empresas em crescimento",
      features: [
        "Até 10.000 produtos",
        "10 usuários",
        "Relatórios avançados",
        "Suporte prioritário",
        "Backup em tempo real",
        "App mobile",
        "Integração com e-commerce",
        "Alertas personalizados",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "R$ 199",
      period: "/mês",
      description: "Para grandes operações",
      features: [
        "Produtos ilimitados",
        "Usuários ilimitados",
        "Relatórios com IA",
        "Suporte 24/7",
        "Backup em tempo real",
        "App mobile",
        "Integrações avançadas",
        "API completa",
        "Gerente de conta dedicado",
      ],
      popular: false,
    },
  ];

  return (
    <section
      id="precos"
      className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Planos que Cabem no seu Orçamento
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua empresa. Todos incluem
            teste grátis de 14 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Começar Teste Grátis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Precisa de algo personalizado? Entre em contato conosco.
          </p>
          <Button variant="outline">Falar com Vendas</Button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Pronto para Transformar sua Gestão?
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Junte-se a milhares de empresas que já otimizaram seus estoques com o
          StockBit. Comece seu teste gratuito hoje mesmo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Começar Teste Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            Agendar Demonstração
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Package className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">StockBit</span>
            </div>
            <p className="text-muted-foreground mb-4">
              A plataforma mais completa para gestão de estoque do mercado.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Integrações
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Status
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Segurança
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 StockBit. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
