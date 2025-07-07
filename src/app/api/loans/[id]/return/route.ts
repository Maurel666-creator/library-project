import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from "@/lib/auth";
import { checkUserRole } from "@/app/middleware";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResponse = requireAuth(request);
    if (authResponse instanceof NextResponse) return authResponse;

    const roleCheck = checkUserRole(authResponse);
    if (roleCheck) return roleCheck;
    const loanId = parseInt(params.id);
    const { dateRetourEffective, remarques } = await request.json();

    try {
        // Vérifier que l'emprunt existe et n'est pas déjà rendu
        const existingLoan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { book: true },
        });

        if (!existingLoan) {
            return NextResponse.json(
                { error: 'Emprunt non trouvé' },
                { status: 404 }
            );
        }

        if (existingLoan.dateReturned) {
            return NextResponse.json(
                { error: 'Ce livre a déjà été retourné' },
                { status: 400 }
            );
        }

        // Mettre à jour l'emprunt et le livre
        const [updatedLoan] = await prisma.$transaction([
            prisma.loan.update({
                where: { id: loanId },
                data: {
                    dateReturned: dateRetourEffective
                        ? new Date(dateRetourEffective)
                        : new Date(),
                    remarks: remarques,
                },
                include: {
                    book: { select: { title: true } },
                    student: {
                        include: {
                            user: { select: { nom: true, prenom: true } },
                        },
                    },
                },
            }),
            prisma.book.update({
                where: { id: existingLoan.bookId },
                data: { disponible: true },
            }),
        ]);

        return NextResponse.json({
            message: `Le livre "${updatedLoan.book.title}" a été marqué comme retourné`,
            loan: {
                ...updatedLoan,
                dateReturned: updatedLoan.dateReturned?.toISOString(),
            },
        });
    } catch (error) {
        console.error('Return error:', error);
        return NextResponse.json(
            { error: 'Erreur lors du retour du livre' },
            { status: 500 }
        );
    }
}