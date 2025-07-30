"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { FileDown, FileUp, Info } from "lucide-react";
import { ExportButton } from "@/components/shared/ExportButton";
import { ImportButton } from "@/components/shared/ImportButton";
import {
  exportIncomesAction,
  exportExpensesAction,
  exportLotsAction,
} from "@/lib/actions/export-actions";
import {
  importIncomesAction,
  importExpensesAction,
  importLotsAction,
} from "@/lib/actions/import-actions";
import { translations } from "@/lib/translations";

export default function AdminConfig() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">⚙️ {translations.admin.title}</h1>
        <p className="mt-2 text-gray-600">{translations.admin.description}</p>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="backup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            {translations.admin.backupTab}
          </TabsTrigger>
          <TabsTrigger value="restore" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            {translations.admin.restoreTab}
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {translations.admin.systemTab}
          </TabsTrigger>
        </TabsList>

        {/* Backup & Export Tab */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                {translations.admin.exportTitle}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {translations.admin.exportDescription}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Incomes Export */}
                <div className="space-y-2">
                  <h3 className="font-medium">
                    💰 {translations.labels.income}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {translations.admin.exportDescriptions.income}
                  </p>
                  <ExportButton
                    onExport={exportIncomesAction}
                    variant="outline"
                    size="default"
                  >
                    {translations.actions.export} {translations.labels.income}
                  </ExportButton>
                </div>

                {/* Expenses Export */}
                <div className="space-y-2">
                  <h3 className="font-medium">
                    💳 {translations.labels.expenses}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {translations.admin.exportDescriptions.expenses}
                  </p>
                  <ExportButton
                    onExport={exportExpensesAction}
                    variant="outline"
                    size="default"
                  >
                    {translations.actions.export} {translations.labels.expenses}
                  </ExportButton>
                </div>

                {/* Lots Export */}
                <div className="space-y-2">
                  <h3 className="font-medium">
                    🏠 {translations.navigation.lots}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {translations.admin.exportDescriptions.lots}
                  </p>
                  <ExportButton
                    onExport={exportLotsAction}
                    variant="outline"
                    size="default"
                  >
                    {translations.actions.export} {translations.navigation.lots}
                  </ExportButton>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-800">
                  ℹ️ {translations.admin.formatInfo.title}
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• {translations.admin.formatInfo.csvFormat}</li>
                  <li>• {translations.admin.formatInfo.currencyFormat}</li>
                  <li>• {translations.admin.formatInfo.dateFormat}</li>
                  <li>• {translations.admin.formatInfo.timestampFormat}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restore Tab */}
        <TabsContent value="restore">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                {translations.admin.restoreTitle}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {translations.admin.restoreDescription}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Import Section */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Incomes Import */}
                <div className="space-y-2">
                  <h3 className="font-medium">
                    💰 {translations.labels.income}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {translations.admin.importDescriptions.income}
                  </p>
                  <ImportButton
                    onImport={importIncomesAction}
                    variant="outline"
                    size="default"
                  >
                    {translations.actions.import} {translations.labels.income}
                  </ImportButton>
                </div>

                {/* Expenses Import */}
                <div className="space-y-2">
                  <h3 className="font-medium">
                    💳 {translations.labels.expenses}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {translations.admin.importDescriptions.expenses}
                  </p>
                  <ImportButton
                    onImport={importExpensesAction}
                    variant="outline"
                    size="default"
                  >
                    {translations.actions.import} {translations.labels.expenses}
                  </ImportButton>
                </div>

                {/* Lots Import */}
                <div className="space-y-2">
                  <h3 className="font-medium">
                    🏠 {translations.navigation.lots}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {translations.admin.importDescriptions.lots}
                  </p>
                  <ImportButton
                    onImport={importLotsAction}
                    variant="outline"
                    size="default"
                  >
                    {translations.actions.import} {translations.navigation.lots}
                  </ImportButton>
                </div>
              </div>

              {/* Import Instructions */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-800">
                  ℹ️ {translations.admin.importInfo.title}
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• {translations.admin.importInfo.csvFormat}</li>
                  <li>• {translations.admin.importInfo.headerMatch}</li>
                  <li>• {translations.admin.importInfo.dateFormat}</li>
                  <li>• {translations.admin.importInfo.backupFirst}</li>
                </ul>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-2 font-medium text-amber-800">
                  ⚠️ {translations.admin.importWarning.title}
                </h4>
                <p className="text-sm text-amber-700">
                  {translations.admin.importWarning.message}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Info Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {translations.admin.systemTitle}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {translations.admin.systemDescription}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* App Info */}
              <div>
                <h3 className="mb-3 font-medium">
                  📱 {translations.admin.appInfoTitle}
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {translations.admin.appLabel}:
                    </span>
                    <span className="font-medium">Plotify</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {translations.admin.versionLabel}:
                    </span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {translations.admin.environmentLabel}:
                    </span>
                    <span className="font-medium">Producción</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="mb-3 font-medium">
                  ✨ {translations.admin.featuresTitle}
                </h3>
                <div className="grid gap-2 text-sm">
                  {translations.admin.features
                    .slice(0, 5)
                    .map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600">⏳</span>
                    <span>{translations.admin.features[5]}</span>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <h4 className="mb-2 font-medium">
                  🛠️ {translations.admin.supportTitle}
                </h4>
                <p className="text-sm text-gray-600">
                  {translations.admin.supportMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
