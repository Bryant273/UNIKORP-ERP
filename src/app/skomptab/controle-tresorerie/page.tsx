'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Landmark, Wallet, CreditCard, Pencil, Trash2, PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// --- DATA TYPES & MOCK DATA ---

type TreasuryAccountType = 'bank' | 'cash';
type TreasuryAccount = {
  id: string;
  name: string;
  type: TreasuryAccountType;
  accountNumber?: string;
  balance: number;
};
type TransactionType = 'Débit' | 'Crédit';
type TreasuryTransaction = {
  id: number;
  date: string;
  label: string;
  accountId: string;
  accountName: string;
  type: TransactionType;
  amount: number;
};

const initialAccounts: TreasuryAccount[] = [
  { id: 'bnpparibas', name: 'BNP Paribas', type: 'bank', accountNumber: '**** **** **** 1234', balance: 76850.25 },
  { id: 'societegenerale', name: 'Société Générale', type: 'bank', accountNumber: '**** **** **** 5678', balance: 14230.10 },
  { id: 'caisseprincipale', name: 'Caisse principale', type: 'cash', balance: 1573.50 },
];

const initialTransactions: TreasuryTransaction[] = [
  { id: 1, date: '2024-07-25', label: 'Paiement fournisseur TechCorp', accountId: 'bnpparibas', accountName: 'BNP Paribas', type: 'Débit', amount: 5400.00 },
  { id: 2, date: '2024-07-24', label: 'Encaissement client Innovate Inc.', accountId: 'bnpparibas', accountName: 'BNP Paribas', type: 'Crédit', amount: 12500.00 },
  { id: 3, date: '2024-07-23', label: 'Achat fournitures de bureau', accountId: 'caisseprincipale', accountName: 'Caisse principale', type: 'Débit', amount: 85.50 },
  { id: 4, date: '2024-07-22', label: 'Virement de SG vers BNP', accountId: 'societegenerale', accountName: 'Société Générale', type: 'Débit', amount: 10000.00 },
  { id: 5, date: '2024-07-22', label: 'Virement de SG vers BNP', accountId: 'bnpparibas', accountName: 'BNP Paribas', type: 'Crédit', amount: 10000.00 },
];

const defaultTransactionData: Omit<TreasuryTransaction, 'id' | 'accountId' | 'accountName'> = {
    date: new Date().toISOString().split('T')[0],
    label: '',
    type: 'Débit',
    amount: 0,
}

// --- MAIN COMPONENT ---

export default function ControleTresoreriePage() {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>(initialAccounts);
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>(initialTransactions);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccounts[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultTransactionData);
  const [editingTransaction, setEditingTransaction] = useState<TreasuryTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<TreasuryTransaction | null>(null);
  const { toast } = useToast();

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)!;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: id === 'amount' ? parseFloat(value) : value }));
  };

  const handleSelectChange = (value: TransactionType) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormData(defaultTransactionData);
  };
  
  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setFormData(defaultTransactionData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (transaction: TreasuryTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
        date: transaction.date,
        label: transaction.label,
        type: transaction.type,
        amount: transaction.amount,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTransaction) {
        // Edit logic
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...editingTransaction, ...formData } : t));
        toast({ title: "Mouvement modifié", description: "Le mouvement de trésorerie a été mis à jour." });

    } else {
        // Create logic
        const newTransaction: TreasuryTransaction = {
            id: Date.now(),
            accountId: selectedAccount.id,
            accountName: selectedAccount.name,
            ...formData,
        };
        setTransactions([newTransaction, ...transactions]);
        toast({ title: "Mouvement enregistré", description: "Le nouveau mouvement de trésorerie a été ajouté." });
    }

    // Update account balance (simplified logic)
    // A more robust solution would re-calculate balance from all transactions
    const amountChange = formData.type === 'Crédit' ? formData.amount : -formData.amount;
    const oldAmount = editingTransaction ? (editingTransaction.type === 'Crédit' ? editingTransaction.amount : -editingTransaction.amount) : 0;
    const balanceDiff = amountChange - oldAmount;

    setAccounts(accounts.map(acc => 
        acc.id === selectedAccount.id ? { ...acc, balance: acc.balance + balanceDiff } : acc
    ));
    
    resetModal();
  };
  
  const handleDeleteTransaction = () => {
    if (!transactionToDelete) return;
    
    // Reverse transaction effect on balance
    const amountChange = transactionToDelete.type === 'Crédit' ? -transactionToDelete.amount : transactionToDelete.amount;
    setAccounts(accounts.map(acc => 
        acc.id === transactionToDelete.accountId ? { ...acc, balance: acc.balance + amountChange } : acc
    ));

    setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
    setTransactionToDelete(null);
    toast({ title: "Mouvement supprimé", description: "Le mouvement de trésorerie a été supprimé." });
  };


  return (
    <div className="flex flex-col gap-6">
      {/* Account Display Card */}
      <Card 
        className={cn(
            "text-white overflow-hidden relative transition-all duration-300", 
            selectedAccount.type === 'bank' 
                ? 'bg-gradient-to-br from-blue-900 to-gray-900' 
                : 'bg-gradient-to-br from-green-800 to-gray-800'
        )}
      >
        <CardContent className="p-6 flex flex-col justify-between h-56">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-sm opacity-80">{selectedAccount.type === 'bank' ? 'Compte Bancaire' : 'Caisse'}</p>
                <p className="text-xl font-semibold">{selectedAccount.name}</p>
            </div>
            {selectedAccount.type === 'bank' 
                ? <Landmark className="h-8 w-8 opacity-70" />
                : <Wallet className="h-8 w-8 opacity-70" />
            }
          </div>
          <div className="space-y-2">
            {selectedAccount.type === 'bank' && (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-8 bg-yellow-400 rounded-md grid place-content-center">
                        <div className="w-6 h-4 bg-yellow-600 rounded-sm"></div>
                    </div>
                    <p className="font-mono text-lg tracking-widest">{selectedAccount.accountNumber}</p>
                </div>
            )}
            <div>
              <p className="text-sm opacity-80">Solde actuel</p>
              <p className="text-3xl font-bold tracking-tight">{selectedAccount.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'FCFA' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Selector and Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl">Comptes de Trésorerie</CardTitle>
                <CardDescription>Sélectionnez un compte et enregistrez un mouvement.</CardDescription>
            </div>
             <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau mouvement
            </Button>
        </CardHeader>
        <CardContent className="flex gap-2">
           {accounts.map(account => (
               <Button 
                key={account.id} 
                variant={selectedAccount.id === account.id ? 'default' : 'outline'}
                onClick={() => setSelectedAccountId(account.id)}
                className="flex-1 h-16 flex-col items-start p-3"
               >
                   <div className="flex items-center gap-2">
                        {account.type === 'bank' ? <Landmark className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                        <span className="font-semibold">{account.name}</span>
                   </div>
                   <span className="text-xs opacity-80">{account.type === 'bank' ? account.accountNumber : 'Espèces'}</span>
               </Button>
           ))}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
            <CardTitle>Derniers Mouvements</CardTitle>
            <CardDescription>Historique des mouvements de trésorerie tous comptes confondus.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Libellé</TableHead>
                        <TableHead>Compte</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>{new Date(tx.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="font-medium">{tx.label}</TableCell>
                            <TableCell className="text-muted-foreground">{tx.accountName}</TableCell>
                            <TableCell>
                                <Badge variant={tx.type === 'Débit' ? 'destructive' : 'default'} className="flex items-center gap-1 w-fit">
                                    {tx.type === 'Débit' ? <ArrowDownCircle className="h-3 w-3"/> : <ArrowUpCircle className="h-3 w-3"/>}
                                    {tx.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'FCFA' })}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(tx)}>
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Modifier</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setTransactionToDelete(tx)} className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Supprimer</span>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* New/Edit Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={resetModal}>
          <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingTransaction ? 'Modifier le mouvement' : 'Nouveau mouvement de trésorerie'}</DialogTitle>
                  <DialogDescription>
                    Enregistrez une entrée ou une sortie pour le compte <span className="font-semibold">{selectedAccount.name}</span>.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={formData.date} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="label">Libellé</Label>
                        <Input id="label" value={formData.label} onChange={handleInputChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type de mouvement</Label>
                            <Select onValueChange={handleSelectChange} value={formData.type}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Sélectionnez un type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Crédit">Crédit (Entrée)</SelectItem>
                                    <SelectItem value="Débit">Débit (Sortie)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Montant</Label>
                            <Input id="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleInputChange} required />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetModal}>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le mouvement sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTransaction} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
