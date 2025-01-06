"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LeisureExpenses {
  jantaresFora: number;
  dateNight: number;
  viagens: number;
}

interface Share {
  fixed: number;
  leisure: LeisureExpenses;
}

interface Shares {
  userShare: Share;
  partnerShare: Share;
}

const ExpenseCalculator = () => {
  const [fixedExpenses, setFixedExpenses] = useState({
    agua: 40,
    luz: 80,
    internet: 35,
    streaming: 25,
    condominio: 30,
  });

  const [groceries, setGroceries] = useState(400);
  const [salaryUser, setSalaryUser] = useState(2350);
  const [salaryPartner, setSalaryPartner] = useState(1900);
  const [selectedOption, setSelectedOption] = useState("proportional");

  const [leisureExpenses, setLeisureExpenses] = useState({
    jantaresFora: 200,
    dateNight: 100,
    viagens: 300,
  });

  const [leisurePercentages, setLeisurePercentages] = useState({
    jantaresFora: { user: 50, partner: 50 },
    dateNight: { user: 50, partner: 50 },
    viagens: { user: 55, partner: 45 },
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalFixedExpenses = Object.values(fixedExpenses).reduce((a, b) => a + b, 0);
  const totalLeisureExpenses = Object.values(leisureExpenses).reduce((a, b) => a + b, 0);
  const totalMonthlyExpenses = totalFixedExpenses + groceries;

  const calculateProportional = () => {
    const totalIncome = salaryUser + salaryPartner;
    const userRatio = salaryUser / totalIncome;
    const partnerRatio = salaryPartner / totalIncome;

    const userShare = {
      fixed: totalMonthlyExpenses * userRatio,
      leisure: {
        jantaresFora: leisureExpenses.jantaresFora * (leisurePercentages.jantaresFora.user / 100),
        dateNight: leisureExpenses.dateNight * (leisurePercentages.dateNight.user / 100),
        viagens: leisureExpenses.viagens * (leisurePercentages.viagens.user / 100),
      },
    };

    const partnerShare = {
      fixed: totalMonthlyExpenses * partnerRatio,
      leisure: {
        jantaresFora: leisureExpenses.jantaresFora * (leisurePercentages.jantaresFora.partner / 100),
        dateNight: leisureExpenses.dateNight * (leisurePercentages.dateNight.partner / 100),
        viagens: leisureExpenses.viagens * (leisurePercentages.viagens.partner / 100),
      },
    };

    return { userShare, partnerShare };
  };

  const calculateFixed = () => {
    const userShare = {
      fixed: totalFixedExpenses + groceries / 2,
      leisure: {
        jantaresFora: leisureExpenses.jantaresFora * (leisurePercentages.jantaresFora.user / 100),
        dateNight: leisureExpenses.dateNight * (leisurePercentages.dateNight.user / 100),
        viagens: leisureExpenses.viagens * (leisurePercentages.viagens.user / 100),
      },
    };

    const partnerShare = {
      fixed: groceries / 2,
      leisure: {
        jantaresFora: leisureExpenses.jantaresFora * (leisurePercentages.jantaresFora.partner / 100),
        dateNight: leisureExpenses.dateNight * (leisurePercentages.dateNight.partner / 100),
        viagens: leisureExpenses.viagens * (leisurePercentages.viagens.partner / 100),
      },
    };

    return { userShare, partnerShare };
  };

  const calculateUserAll = () => {
    return {
      userShare: {
        fixed: totalMonthlyExpenses,
        leisure: {
          jantaresFora: leisureExpenses.jantaresFora * (leisurePercentages.jantaresFora.user / 100),
          dateNight: leisureExpenses.dateNight * (leisurePercentages.dateNight.user / 100),
          viagens: leisureExpenses.viagens * (leisurePercentages.viagens.user / 100),
        },
      },
      partnerShare: {
        fixed: 0,
        leisure: {
          jantaresFora: leisureExpenses.jantaresFora * (leisurePercentages.jantaresFora.partner / 100),
          dateNight: leisureExpenses.dateNight * (leisurePercentages.dateNight.partner / 100),
          viagens: leisureExpenses.viagens * (leisurePercentages.viagens.partner / 100),
        },
      },
    };
  };

  const getShares = (): Shares => {
    switch (selectedOption) {
      case "proportional":
        return calculateProportional();
      case "fixed":
        return calculateFixed();
      case "userAll":
        return calculateUserAll();
      default:
        return {
          userShare: {
            fixed: 0,
            leisure: { jantaresFora: 0, dateNight: 0, viagens: 0 },
          },
          partnerShare: {
            fixed: 0,
            leisure: { jantaresFora: 0, dateNight: 0, viagens: 0 },
          },
        };
    }
  };

  const shares = getShares();

  const totalUserLeisure = Object.values(shares.userShare.leisure).reduce((a, b) => a + b, 0);
  const totalPartnerLeisure = Object.values(shares.partnerShare.leisure).reduce((a, b) => a + b, 0);

  const handlePercentageChange = (
    expense: keyof typeof leisurePercentages,
    person: "user" | "partner",
    value: number
  ) => {
    const otherPerson = person === "user" ? "partner" : "user";
    setLeisurePercentages((prev) => ({
      ...prev,
      [expense]: {
        [person]: value,
        [otherPerson]: 100 - value,
      },
    }));
  };

  const addLeisureCategory = () => {
    if (newCategoryName.trim()) {
      const formattedCategory = newCategoryName.trim().toLowerCase().replace(/\s+/g, "_");

      setLeisureExpenses((prev) => ({
        ...prev,
        [formattedCategory]: 0,
      }));

      setLeisurePercentages((prev) => ({
        ...prev,
        [formattedCategory]: { user: 50, partner: 50 },
      }));

      setNewCategoryName("");
      setDialogOpen(false);
    }
  };

  const removeLeisureCategory = (category: string) => {
    setLeisureExpenses((prev) => {
      const newExpenses = { ...prev };
      delete newExpenses[category];
      return newExpenses;
    });

    setLeisurePercentages((prev) => {
      const newPercentages = { ...prev };
      delete newPercentages[category];
      return newPercentages;
    });
  };

  return (
    <Card className="w-full max-w-6xl p-6 mx-auto my-8">
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Rendimentos Mensais</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm">Seu Salário:</label>
                    <input
                      type="number"
                      value={salaryUser}
                      onChange={(e) => setSalaryUser(Number(e.target.value))}
                      className="border rounded p-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Salário Namorada:</label>
                    <input
                      type="number"
                      value={salaryPartner}
                      onChange={(e) => setSalaryPartner(Number(e.target.value))}
                      className="border rounded p-2 w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Despesas Mensais Fixas</h3>
                {Object.entries(fixedExpenses).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <label className="block text-sm capitalize">{key}:</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setFixedExpenses({ ...fixedExpenses, [key]: Number(e.target.value) })}
                      className="border rounded p-2 w-full"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm">Despesas Supermercado:</label>
                <input
                  type="number"
                  value={groceries}
                  onChange={(e) => setGroceries(Number(e.target.value))}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Despesas de Lazer</h3>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="px-3 py-1 text-sm">
                        + Adicionar Categoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Adicionar Nova Categoria de Lazer</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Input
                            id="name"
                            placeholder="Nome da categoria"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addLeisureCategory();
                              }
                            }}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" onClick={addLeisureCategory} disabled={!newCategoryName.trim()}>
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Use os controles deslizantes para ajustar a percentagem que cada pessoa paga nas despesas de lazer.
                  Por exemplo, 60%/40% significa que você paga 60% e sua namorada paga 40% dessa despesa.
                </p>
                {Object.entries(leisureExpenses).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm capitalize">{key.replace(/_/g, " ")}:</label>
                      <button
                        onClick={() => removeLeisureCategory(key)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Remover categoria"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setLeisureExpenses({ ...leisureExpenses, [key]: Number(e.target.value) })}
                        className="border rounded p-2 w-full"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={leisurePercentages[key as keyof typeof leisurePercentages].user}
                          onChange={(e) =>
                            handlePercentageChange(
                              key as keyof typeof leisurePercentages,
                              "user",
                              Number(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                        <span className="text-sm w-16">
                          {leisurePercentages[key as keyof typeof leisurePercentages].user}% /{" "}
                          {leisurePercentages[key as keyof typeof leisurePercentages].partner}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Método de Divisão</h3>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="proportional">Proporcional aos Rendimentos</option>
                <option value="fixed">Fixos (Você) + Supermercado (50/50)</option>
                <option value="userAll">Você Paga Tudo</option>
              </select>

              <div className="mt-4 text-sm text-gray-600">
                {selectedOption === "proportional" && (
                  <div className="space-y-2">
                    <p>• Considerando salários: Você (≈2350€) e sua namorada (≈1900€)</p>
                    <p>• As despesas são divididas proporcionalmente à renda de cada um</p>
                    <p>• Mais justo considerando a diferença salarial</p>
                  </div>
                )}
                {selectedOption === "fixed" && (
                  <div className="space-y-2">
                    <p>• Você assume todas as despesas fixas (água, luz, internet, etc.)</p>
                    <p>• Despesas de supermercado divididas igualmente</p>
                    <p>• Compensa o investimento inicial da sua namorada na casa</p>
                  </div>
                )}
                {selectedOption === "userAll" && (
                  <div className="space-y-2">
                    <p>• Assume todas as despesas mensais</p>
                    <p>• Compensa o investimento significativo da sua namorada/família na casa e móveis</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold">Resultado Mensal</h3>

              <div>
                <h4 className="font-medium mb-2">Despesas Fixas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">Sua Parte:</p>
                    <p className="text-lg font-semibold">{shares.userShare.fixed.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-sm">Parte da Namorada:</p>
                    <p className="text-lg font-semibold">{shares.partnerShare.fixed.toFixed(2)}€</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Despesas de Lazer</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">Sua Parte:</p>
                    <p className="text-lg font-semibold">{totalUserLeisure.toFixed(2)}€</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>Jantares: {shares.userShare.leisure.jantaresFora.toFixed(2)}€</p>
                      <p>Date Night: {shares.userShare.leisure.dateNight.toFixed(2)}€</p>
                      <p>Viagens: {shares.userShare.leisure.viagens.toFixed(2)}€</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">Parte da Namorada:</p>
                    <p className="text-lg font-semibold">{totalPartnerLeisure.toFixed(2)}€</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>Jantares: {shares.partnerShare.leisure.jantaresFora.toFixed(2)}€</p>
                      <p>Date Night: {shares.partnerShare.leisure.dateNight.toFixed(2)}€</p>
                      <p>Viagens: {shares.partnerShare.leisure.viagens.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Total Mensal</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">Sua Parte Total:</p>
                    <p className="text-lg font-semibold">{(shares.userShare.fixed + totalUserLeisure).toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-sm">Parte Total da Namorada:</p>
                    <p className="text-lg font-semibold">
                      {(shares.partnerShare.fixed + totalPartnerLeisure).toFixed(2)}€
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCalculator;
