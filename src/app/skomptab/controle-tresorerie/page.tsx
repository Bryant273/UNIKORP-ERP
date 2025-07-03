'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Landmark, Wallet, CreditCard, Pencil, Trash2, PlusCircle, ArrowUpCircle, ArrowDownCircle, Eye, EyeOff } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
type TransactionType = 'Crédit' | 'Débit';
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
  { id: 'bnpparibas', name: 'BNP Paribas', type: 'bank', accountNumber: 'FR763000400005000012345678', balance: 76850.25 },
  { id: 'societegenerale', name: 'Société Générale', type: 'bank', accountNumber: 'FR7630002005500000157890Z42', balance: 14230.10 },
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
const defaultNewAccountData: Omit<TreasuryAccount, 'id'> = {
    name: '',
    type: 'bank',
    accountNumber: '',
    balance: 0,
}

const maskAccountNumber = (number?: string) => {
    if (!number) return '';
    return `**** **** **** ${number.slice(-4)}`;
}

// --- MAIN COMPONENT ---

export default function ControleTresoreriePage() {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>(initialAccounts);
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>(initialTransactions);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccounts[0].id);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAccountNumberVisible, setIsAccountNumberVisible] = useState(false);
  
  const [transactionFormData, setTransactionFormData] = useState(defaultTransactionData);
  const [newAccountFormData, setNewAccountFormData] = useState(defaultNewAccountData);
  
  const [editingTransaction, setEditingTransaction] = useState<TreasuryTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<TreasuryTransaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<TreasuryTransaction | null>(null);
  const { toast } = useToast();

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)!;

  const handleTransactionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setTransactionFormData(prev => ({ ...prev, [id]: id === 'amount' ? parseFloat(value) : value }));
  };

  const handleTransactionSelectChange = (value: TransactionType) => {
    setTransactionFormData(prev => ({ ...prev, type: value }));
  };

  const resetTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
    setTransactionFormData(defaultTransactionData);
  };
  
  const handleOpenCreateTransactionModal = () => {
    setEditingTransaction(null);
    setTransactionFormData(defaultTransactionData);
    setIsTransactionModalOpen(true);
  };
  
  const handleOpenEditTransactionModal = (transaction: TreasuryTransaction) => {
    setEditingTransaction(transaction);
    setTransactionFormData({
        date: transaction.date,
        label: transaction.label,
        type: transaction.type,
        amount: transaction.amount,
    });
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTransaction) {
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...editingTransaction, ...transactionFormData } : t));
        toast({ title: "Mouvement modifié", description: "Le mouvement de trésorerie a été mis à jour." });

    } else {
        const newTransaction: TreasuryTransaction = {
            id: Date.now(),
            accountId: selectedAccount.id,
            accountName: selectedAccount.name,
            ...transactionFormData,
        };
        setTransactions([newTransaction, ...transactions]);
        toast({ title: "Mouvement enregistré", description: "Le nouveau mouvement de trésorerie a été ajouté." });
    }

    const amountChange = transactionFormData.type === 'Crédit' ? transactionFormData.amount : -transactionFormData.amount;
    const oldAmount = editingTransaction ? (editingTransaction.type === 'Crédit' ? editingTransaction.amount : -editingTransaction.amount) : 0;
    const balanceDiff = amountChange - oldAmount;

    setAccounts(accounts.map(acc => 
        acc.id === (editingTransaction?.accountId || selectedAccount.id) ? { ...acc, balance: acc.balance + balanceDiff } : acc
    ));
    
    resetTransactionModal();
  };
  
  const handleDeleteTransaction = () => {
    if (!transactionToDelete) return;
    
    const amountChange = transactionToDelete.type === 'Crédit' ? -transactionToDelete.amount : transactionToDelete.amount;
    setAccounts(accounts.map(acc => 
        acc.id === transactionToDelete.accountId ? { ...acc, balance: acc.balance + amountChange } : acc
    ));

    setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
    setTransactionToDelete(null);
    toast({ title: "Mouvement supprimé", description: "Le mouvement de trésorerie a été supprimé." });
  };
  
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount: TreasuryAccount = {
        id: newAccountFormData.name.toLowerCase().replace(/\s/g, '') + Date.now(),
        ...newAccountFormData
    };
    setAccounts(prev => [...prev, newAccount]);
    setIsAccountModalOpen(false);
    setNewAccountFormData(defaultNewAccountData); 
    toast({ title: 'Compte créé', description: `Le compte ${newAccount.name} a été ajouté.` });
  };
  
  const handleNewAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewAccountFormData(prev => ({...prev, [id]: id === 'balance' ? parseFloat(value) : value }));
  };


  return (
    <div className="flex flex-col gap-6">
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
                <div className="flex items-center gap-2">
                    <div className="w-10 h-8 bg-yellow-400 rounded-md grid place-content-center">
                        <div className="w-6 h-4 bg-yellow-600 rounded-sm"></div>
                    </div>
                    <p className="font-mono text-lg tracking-widest flex-1">
                        {isAccountNumberVisible ? selectedAccount.accountNumber : maskAccountNumber(selectedAccount.accountNumber)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsAccountNumberVisible(!isAccountNumberVisible)}>
                        {isAccountNumberVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        <span className="sr-only">Toggle visibility</span>
                    </Button>
                </div>
            )}
            <div>
              <p className="text-sm opacity-80">Solde actuel</p>
              <p className="text-3xl font-bold tracking-tight">{selectedAccount.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl">Opérations de Trésorerie</CardTitle>
                <CardDescription>Sélectionnez un compte et gérez les mouvements.</CardDescription>
            </div>
             <Button onClick={handleOpenCreateTransactionModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau mouvement
            </Button>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
                <Label htmlFor="account-selector">Compte sélectionné</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger id="account-selector">
                        <SelectValue placeholder="Sélectionnez un compte" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                                <div className="flex items-center gap-2">
                                    {account.type === 'bank' ? <Landmark className="h-4 w-4 text-muted-foreground" /> : <Wallet className="h-4 w-4 text-muted-foreground" />}
                                    <span>{account.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="outline" onClick={() => setIsAccountModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un compte
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Derniers Mouvements</CardTitle>
            <CardDescription>Historique des mouvements de trésorerie tous comptes confondus.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Libellé</TableHead>
                        <TableHead className="text-center">Compte</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Montant</TableHead>
                        <TableHead className="w-[100px] text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map(tx => (
                        <TableRow key={tx.id} className="odd:bg-muted/50">
                            <TableCell className="text-center">{new Date(tx.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="font-medium text-center">{tx.label}</TableCell>
                            <TableCell className="text-muted-foreground text-center">{tx.accountName}</TableCell>
                            <TableCell className="flex justify-center">
                                <Badge variant={tx.type === 'Débit' ? 'destructive' : 'default'} className="flex items-center gap-1 w-fit">
                                    {tx.type === 'Débit' ? <ArrowDownCircle className="h-3 w-3"/> : <ArrowUpCircle className="h-3 w-3"/>}
                                    {tx.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center font-mono">{tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setViewingTransaction(tx)}>
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Voir</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditTransactionModal(tx)}>
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

      <Dialog open={isTransactionModalOpen} onOpenChange={resetTransactionModal}>
          <DialogContent>
              <form onSubmit={handleTransactionSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingTransaction ? 'Modifier le mouvement' : 'Nouveau mouvement de trésorerie'}</DialogTitle>
                  <DialogDescription>
                    Enregistrez une entrée ou une sortie pour le compte <span className="font-semibold">{selectedAccount.name}</span>.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={transactionFormData.date} onChange={handleTransactionInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="label">Libellé</Label>
                        <Input id="label" value={transactionFormData.label} onChange={handleTransactionInputChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type de mouvement</Label>
                            <Select onValueChange={handleTransactionSelectChange} value={transactionFormData.type}>
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
                            <Label htmlFor="amount">Montant (XOF)</Label>
                            <Input id="amount" type="number" step="0.01" min="0" value={transactionFormData.amount} onChange={handleTransactionInputChange} required />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetTransactionModal}>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
        <DialogContent>
            <form onSubmit={handleCreateAccount}>
                <DialogHeader>
                    <DialogTitle>Ajouter un compte de trésorerie</DialogTitle>
                    <DialogDescription>
                        Créez un nouveau compte bancaire ou une nouvelle caisse.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type de compte</Label>
                        <RadioGroup defaultValue="bank" value={newAccountFormData.type} onValueChange={(value: TreasuryAccountType) => setNewAccountFormData(p => ({...p, type: value}))}>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="bank" id="r-bank" /><Label htmlFor="r-bank" className="font-normal">Compte Bancaire</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="cash" id="r-cash" /><Label htmlFor="r-cash" className="font-normal">Caisse</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du compte / de la caisse</Label>
                        <Input id="name" value={newAccountFormData.name} onChange={handleNewAccountInputChange} required/>
                    </div>
                    {newAccountFormData.type === 'bank' && (
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber">Numéro de compte (IBAN)</Label>
                            <Input id="accountNumber" value={newAccountFormData.accountNumber} onChange={handleNewAccountInputChange}/>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="balance">Solde initial (XOF)</Label>
                        <Input id="balance" type="number" value={newAccountFormData.balance} onChange={handleNewAccountInputChange} required/>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAccountModalOpen(false)}>Annuler</Button>
                    <Button type="submit">Créer le compte</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
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

      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Détails du Mouvement</DialogTitle>
            <DialogDescription>
                Consultez les informations détaillées de la transaction.
            </DialogDescription>
            </DialogHeader>
            {viewingTransaction && (
            <div className="grid gap-3 py-4 text-sm">
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date(viewingTransaction.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Libellé</span>
                    <span className="font-medium text-right">{viewingTransaction.label}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Compte</span>
                    <span className="font-medium">{viewingTransaction.accountName}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant={viewingTransaction.type === 'Débit' ? 'destructive' : 'default'} className="flex items-center gap-1 w-fit">
                        {viewingTransaction.type === 'Débit' ? <ArrowDownCircle className="h-3 w-3"/> : <ArrowUpCircle className="h-3 w-3"/>}
                        {viewingTransaction.type}
                    </Badge>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Montant</span>
                    <span className="font-bold text-lg">{viewingTransaction.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                </div>
            </div>
            )}
            <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewingTransaction(null)}>Fermer</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  );
}
