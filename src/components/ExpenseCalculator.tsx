"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const defaultFixedCategories = [
  { name: "agua", value: 40 },
  { name: "luz", value: 80 },
  { name: "internet", value: 35 },
  { name: "streaming", value: 25 },
  { name: "condominio", value: 30 },
];

const defaultLeisureCategories = [
  { name: "jantares_fora", value: 200, userPercentage: 50, partnerPercentage: 50 },
  { name: "date_night", value: 100, userPercentage: 50, partnerPercentage: 50 },
  { name: "viagens", value: 300, userPercentage: 55, partnerPercentage: 45 },
];

const ExpenseCalculator = () => {
  const [fixedCategories, setFixedCategories] = useState(defaultFixedCategories);
  const [leisureCategories, setLeisureCategories] = useState(defaultLeisureCategories);
  const [groceries, setGroceries] = useState(400);
  const [salaryUser, setSalaryUser] = useState(2350);
  const [salaryPartner, setSalaryPartner] = useState(1900);
  const [selectedOption, setSelectedOption] = useState("proportional");

  useEffect(() => {
    // Load categories from local storage on component mount

    // Retrieve the stored data from local storage
    const storedFixedCategories = localStorage.getItem("fixedCategories");
    const storedLeisureCategories = localStorage.getItem("leisureCategories");

    // Check if fixedCategories data exists in local storage
    if (storedFixedCategories) {
      try {
        // Parse the stored data from JSON string to an array
        const parsedFixedCategories = JSON.parse(storedFixedCategories);

        // Validate that the parsed data is an array
        if (Array.isArray(parsedFixedCategories)) {
          // If the parsed data is an array, update the state with the retrieved categories
          setFixedCategories(parsedFixedCategories);
        }
      } catch (error) {
        // If an error occurs while parsing or validating the data, log the error
        console.error("Error parsing fixedCategories from local storage:", error);
      }
    }

    // Check if leisureCategories data exists in local storage
    if (storedLeisureCategories) {
      try {
        // Parse the stored data from JSON string to an array
        const parsedLeisureCategories = JSON.parse(storedLeisureCategories);

        // Validate that the parsed data is an array
        if (Array.isArray(parsedLeisureCategories)) {
          // If the parsed data is an array, update the state with the retrieved categories
          setLeisureCategories(parsedLeisureCategories);
        }
      } catch (error) {
        // If an error occurs while parsing or validating the data, log the error
        console.error("Error parsing leisureCategories from local storage:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save categories to local storage whenever they change
    localStorage.setItem("fixedCategories", JSON.stringify(fixedCategories));
    localStorage.setItem("leisureCategories", JSON.stringify(leisureCategories));
  }, [fixedCategories, leisureCategories]);

  const formatCategoryName = (name: string) => {
    return name
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const addFixedCategory = (category: { name: string; value: number }) => {
    setFixedCategories([...fixedCategories, category]);
  };

  const removeFixedCategory = (categoryName: string) => {
    setFixedCategories(fixedCategories.filter((c) => c.name !== categoryName));
  };

  const addLeisureCategory = (category: {
    name: string;
    value: number;
    userPercentage: number;
    partnerPercentage: number;
  }) => {
    setLeisureCategories([...leisureCategories, category]);
  };

  const removeLeisureCategory = (categoryName: string) => {
    setLeisureCategories(leisureCategories.filter((c) => c.name !== categoryName));
  };

  const totalFixedExpenses = fixedCategories.reduce((sum, category) => sum + category.value, 0);
  const totalLeisureExpenses = leisureCategories.reduce((sum, category) => sum + category.value, 0);
  const totalMonthlyExpenses = totalFixedExpenses + groceries;

  const calculateProportional = () => {
    const totalIncome = salaryUser + salaryPartner;
    const userRatio = salaryUser / totalIncome;
    const partnerRatio = salaryPartner / totalIncome;

    const userShare = {
      fixed: totalMonthlyExpenses * userRatio,
      leisure: leisureCategories.reduce((sum, category) => sum + category.value * (category.userPercentage / 100), 0),
    };

    const partnerShare = {
      fixed: totalMonthlyExpenses * partnerRatio,
      leisure: leisureCategories.reduce(
        (sum, category) => sum + category.value * (category.partnerPercentage / 100),
        0
      ),
    };

    return { userShare, partnerShare };
  };

  const calculateFixed = () => {
    const userShare = {
      fixed: totalFixedExpenses + groceries / 2,
      leisure: leisureCategories.reduce((sum, category) => sum + category.value * (category.userPercentage / 100), 0),
    };

    const partnerShare = {
      fixed: groceries / 2,
      leisure: leisureCategories.reduce(
        (sum, category) => sum + category.value * (category.partnerPercentage / 100),
        0
      ),
    };

    return { userShare, partnerShare };
  };

  const calculateUserAll = () => ({
    userShare: {
      fixed: totalMonthlyExpenses,
      leisure: leisureCategories.reduce((sum, category) => sum + category.value * (category.userPercentage / 100), 0),
    },
    partnerShare: {
      fixed: 0,
      leisure: leisureCategories.reduce(
        (sum, category) => sum + category.value * (category.partnerPercentage / 100),
        0
      ),
    },
  });

  const getShares = () => {
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
            leisure: 0,
          },
          partnerShare: {
            fixed: 0,
            leisure: 0,
          },
        };
    }
  };

  const { userShare, partnerShare } = getShares();

  const handlePercentageChange = (categoryName: any, person: any, value: any) => {
    const updatedCategories = leisureCategories.map((category) => {
      if (category.name === categoryName) {
        return {
          ...category,
          userPercentage: person === "user" ? value : 100 - value,
          partnerPercentage: person === "partner" ? value : 100 - value,
        };
      }
      return category;
    });

    setLeisureCategories(updatedCategories);
  };

  return (
    <Card className="w-full max-w-6xl p-8 mx-auto my-8 bg-white shadow-lg">
      <CardContent>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Rendimentos Mensais */}
            <div>
              <h3 className="text-2xl font-bold mb-4">💰 Rendimentos Mensais</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-base mb-2">👤 Seu Salário:</label>
                  <input
                    type="number"
                    value={salaryUser}
                    onChange={(e) => setSalaryUser(Number(e.target.value))}
                    className="border rounded-lg p-3 w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-base mb-2">👩 Salário Namorada:</label>
                  <input
                    type="number"
                    value={salaryPartner}
                    onChange={(e) => setSalaryPartner(Number(e.target.value))}
                    className="border rounded-lg p-3 w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Despesas Mensais Fixas */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">📊 Despesas Mensais Fixas</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      className="rounded-full px-6 py-2 text-base font-medium bg-black hover:bg-gray-800"
                    >
                      <span className="mr-2">+</span>
                      Adicionar Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Input
                          id="name"
                          placeholder="Nome da categoria"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const name = e.currentTarget.value.trim();
                              if (name) {
                                addFixedCategory({ name, value: 0 });
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-gray-600 mb-8 text-base">
                Para as despesas mensais fixas, você pode definir um valor para cada categoria de despesa, como água,
                luz, internet, etc. Esses valores serão usados para calcular o total de despesas mensais e, dependendo
                do método de divisão escolhido, determinar a parte que cada pessoa pagará.
              </p>
              <div className="space-y-4">
                {fixedCategories.map((category) => (
                  <div key={category.name} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-base capitalize">{category.name}:</label>
                      <button
                        onClick={() => removeFixedCategory(category.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover categoria"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="number"
                      value={category.value}
                      onChange={(e) =>
                        setFixedCategories(
                          fixedCategories.map((c) =>
                            c.name === category.name ? { ...c, value: Number(e.target.value) } : c
                          )
                        )
                      }
                      className="border rounded-lg p-3 w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Despesas Supermercado */}
            <div>
              <h3 className="text-2xl font-bold mb-4">🛒 Despesas Supermercado</h3>
              <p className="text-gray-600 mb-8 text-base">
                Para as despesas de supermercado, insira o valor total gasto mensalmente em compras de supermercado.
                Esse valor será usado no cálculo da divisão das despesas, dependendo do método escolhido.
              </p>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <input
                  type="number"
                  value={groceries}
                  onChange={(e) => setGroceries(Number(e.target.value))}
                  className="border rounded-lg p-3 w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Despesas de Lazer */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">🎉 Despesas de Lazer</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      className="rounded-full px-6 py-2 text-base font-medium bg-black hover:bg-gray-800"
                    >
                      <span className="mr-2">+</span>
                      Adicionar Categoria
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const name = e.currentTarget.value.trim();
                              if (name) {
                                addLeisureCategory({
                                  name,
                                  value: 0,
                                  userPercentage: 50,
                                  partnerPercentage: 50,
                                });
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-gray-600 mb-8 text-base">
                Use os controles deslizantes para ajustar a percentagem que cada pessoa paga nas despesas de lazer. Por
                exemplo, 60%/40% significa que você paga 60% e sua namorada paga 40% dessa despesa.
              </p>
              {leisureCategories.map((category) => (
                <div key={category.name} className="mb-6 bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-medium capitalize">{formatCategoryName(category.name)}:</label>
                    <button
                      onClick={() => removeLeisureCategory(category.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remover categoria"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <input
                      type="number"
                      value={category.value}
                      onChange={(e) =>
                        setLeisureCategories(
                          leisureCategories.map((c) =>
                            c.name === category.name ? { ...c, value: Number(e.target.value) } : c
                          )
                        )
                      }
                      className="border rounded-lg p-3 w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={category.userPercentage}
                        onChange={(e) => handlePercentageChange(category.name, "user", Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black"
                      />

                      <span className="text-base font-medium min-w-[80px] text-right">
                        {category.userPercentage}% / {category.partnerPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Método de Divisão */}
            <div>
              <h3 className="text-2xl font-bold mb-4">⚖️ Método de Divisão</h3>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="border rounded-lg p-3 w-full text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="proportional">Proporcional aos Rendimentos</option>
                <option value="fixed">Fixos (Você) + Supermercado (50/50)</option>
                <option value="userAll">Você Paga Tudo</option>
              </select>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                {selectedOption === "proportional" && (
                  <div className="space-y-3">
                    <p className="text-base text-gray-600">
                      • Considerando salários: Você (≈{salaryUser}€) e sua namorada (≈{salaryPartner}€)
                    </p>
                    <p className="text-base text-gray-600">
                      • As despesas são divididas proporcionalmente à renda de cada um
                    </p>
                    <p className="text-base text-gray-600">• Mais justo considerando a diferença salarial</p>
                  </div>
                )}
                {selectedOption === "fixed" && (
                  <div className="space-y-3">
                    <p className="text-base text-gray-600">
                      • Você assume todas as despesas fixas (água, luz, internet, etc.)
                    </p>
                    <p className="text-base text-gray-600">• Despesas de supermercado divididas igualmente</p>
                    <p className="text-base text-gray-600">• Compensa o investimento inicial da sua namorada na casa</p>
                  </div>
                )}
                {selectedOption === "userAll" && (
                  <div className="space-y-3">
                    <p className="text-base text-gray-600">• Assume todas as despesas mensais</p>
                    <p className="text-base text-gray-600">
                      • Compensa o investimento significativo da sua namorada/família na casa e móveis
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resultado Mensal */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-2xl font-bold">📝 Resultado Mensal</h3>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">💸 Despesas Fixas</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-base text-gray-600">Sua Parte:</p>
                    <p className="text-2xl font-bold">{userShare.fixed.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Parte da Namorada:</p>
                    <p className="text-2xl font-bold">{partnerShare.fixed.toFixed(2)}€</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">🎯 Despesas de Lazer</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-base text-gray-600">Sua Parte:</p>
                    <p className="text-2xl font-bold">{userShare.leisure.toFixed(2)}€</p>
                    <div className="mt-2 space-y-1">
                      {leisureCategories.map((category) => (
                        <p key={category.name} className="text-sm text-gray-500">
                          {formatCategoryName(category.name)}:{" "}
                          {((category.value * category.userPercentage) / 100).toFixed(2)}€
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Parte da Namorada:</p>
                    <p className="text-2xl font-bold">{partnerShare.leisure.toFixed(2)}€</p>
                    <div className="mt-2 space-y-1">
                      {leisureCategories.map((category) => (
                        <p key={category.name} className="text-sm text-gray-500">
                          {formatCategoryName(category.name)}:{" "}
                          {((category.value * category.partnerPercentage) / 100).toFixed(2)}€
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">🧮 Total Mensal</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-base text-gray-600">Sua Parte Total:</p>
                    <p className="text-2xl font-bold">{(userShare.fixed + userShare.leisure).toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Parte Total da Namorada:</p>
                    <p className="text-2xl font-bold">{(partnerShare.fixed + partnerShare.leisure).toFixed(2)}€</p>
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
