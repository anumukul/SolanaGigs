use anchor_lang::prelude::*;

declare_id!("3dQMTqj9XbXDzkG2E3n2qMwgaBqZFmWWXzrgTFEscyLW");

#[program]
pub mod task_escrow {
    use super::*;

    /// Initialize a new task escrow
    pub fn create_task_escrow(
        ctx: Context<CreateTaskEscrow>,
        task_id: String,
        amount: u64,
        worker: Pubkey,
    ) -> Result<()> {
        require!(task_id.len() <= 50, TaskEscrowError::TaskIdTooLong);
        
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;
        
        escrow.poster = ctx.accounts.poster.key();
        escrow.worker = worker;
        escrow.task_id = task_id;
        escrow.amount = amount;
        escrow.status = EscrowStatus::Created;
        escrow.created_at = clock.unix_timestamp;
        escrow.funded_at = None;
        escrow.released_at = None;
        escrow.cancelled_at = None;
        escrow.bump = ctx.bumps.escrow;

        msg!("Task escrow created for task: {}", escrow.task_id);
        Ok(())
    }

    /// Fund the escrow with SOL
    pub fn fund_escrow(ctx: Context<FundEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Created,
            TaskEscrowError::InvalidEscrowStatus
        );

        // Transfer SOL from poster to escrow PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.poster.to_account_info(),
                to: escrow.to_account_info(),
            },
        );

        anchor_lang::system_program::transfer(cpi_context, escrow.amount)?;

        escrow.status = EscrowStatus::Funded;
        escrow.funded_at = Some(Clock::get()?.unix_timestamp);

        msg!("Escrow funded with {} lamports for task: {}", escrow.amount, escrow.task_id);
        Ok(())
    }

    /// Release funds to worker
    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(
            escrow.status == EscrowStatus::Funded,
            TaskEscrowError::InvalidEscrowStatus
        );

        require!(
            escrow.poster == ctx.accounts.poster.key(),
            TaskEscrowError::UnauthorizedPoster
        );

        require!(
            escrow.worker == ctx.accounts.worker.key(),
            TaskEscrowError::InvalidWorker
        );

        // Calculate available lamports
        let escrow_lamports = escrow.to_account_info().lamports();
        let rent = Rent::get()?;
        let rent_exempt_amount = rent.minimum_balance(escrow.to_account_info().data_len());
        let available_amount = escrow_lamports.saturating_sub(rent_exempt_amount);

        // Transfer SOL to worker
        **escrow.to_account_info().try_borrow_mut_lamports()? -= available_amount;
        **ctx.accounts.worker.try_borrow_mut_lamports()? += available_amount;

        escrow.status = EscrowStatus::Released;
        escrow.released_at = Some(Clock::get()?.unix_timestamp);

        msg!(
            "Funds released: {} lamports to worker {} for task: {}",
            available_amount,
            ctx.accounts.worker.key(),
            escrow.task_id
        );
        Ok(())
    }

    /// Cancel escrow and return funds to poster
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(
            escrow.status == EscrowStatus::Funded,
            TaskEscrowError::InvalidEscrowStatus
        );

        require!(
            escrow.poster == ctx.accounts.poster.key(),
            TaskEscrowError::UnauthorizedPoster
        );

        // Calculate available lamports
        let escrow_lamports = escrow.to_account_info().lamports();
        let rent = Rent::get()?;
        let rent_exempt_amount = rent.minimum_balance(escrow.to_account_info().data_len());
        let available_amount = escrow_lamports.saturating_sub(rent_exempt_amount);

        // Return SOL to poster
        **escrow.to_account_info().try_borrow_mut_lamports()? -= available_amount;
        **ctx.accounts.poster.try_borrow_mut_lamports()? += available_amount;

        escrow.status = EscrowStatus::Cancelled;
        escrow.cancelled_at = Some(Clock::get()?.unix_timestamp);

        msg!(
            "Escrow cancelled: {} lamports returned to poster for task: {}",
            available_amount,
            escrow.task_id
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(task_id: String)]
pub struct CreateTaskEscrow<'info> {
    #[account(
        init,
        payer = poster,
        space = TaskEscrow::SPACE,
        seeds = [b"task_escrow", task_id.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, TaskEscrow>,
    
    #[account(mut)]
    pub poster: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(
        mut,
        seeds = [b"task_escrow", escrow.task_id.as_bytes()],
        bump = escrow.bump,
        constraint = escrow.poster == poster.key() @ TaskEscrowError::UnauthorizedPoster
    )]
    pub escrow: Account<'info, TaskEscrow>,
    
    #[account(mut)]
    pub poster: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(
        mut,
        seeds = [b"task_escrow", escrow.task_id.as_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, TaskEscrow>,
    
    #[account(mut)]
    pub poster: Signer<'info>,
    
    /// CHECK: Worker account verified through escrow data
    #[account(mut)]
    pub worker: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(
        mut,
        seeds = [b"task_escrow", escrow.task_id.as_bytes()],
        bump = escrow.bump,
        constraint = escrow.poster == poster.key() @ TaskEscrowError::UnauthorizedPoster
    )]
    pub escrow: Account<'info, TaskEscrow>,
    
    #[account(mut)]
    pub poster: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct TaskEscrow {
    pub poster: Pubkey,          // 32 bytes
    pub worker: Pubkey,          // 32 bytes
    pub task_id: String,         // 4 + 50 bytes (max)
    pub amount: u64,             // 8 bytes
    pub status: EscrowStatus,    // 1 byte
    pub created_at: i64,         // 8 bytes
    pub funded_at: Option<i64>,  // 1 + 8 bytes
    pub released_at: Option<i64>, // 1 + 8 bytes
    pub cancelled_at: Option<i64>, // 1 + 8 bytes
    pub bump: u8,                // 1 byte
}

impl TaskEscrow {
    pub const SPACE: usize = 8 + 32 + 32 + 4 + 50 + 8 + 1 + 8 + 9 + 9 + 9 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Released,
    Cancelled,
}

#[error_code]
pub enum TaskEscrowError {
    #[msg("Invalid escrow status for this operation")]
    InvalidEscrowStatus,
    
    #[msg("Unauthorized poster")]
    UnauthorizedPoster,
    
    #[msg("Invalid worker for this escrow")]
    InvalidWorker,
    
    #[msg("Task ID too long (max 50 characters)")]
    TaskIdTooLong,
}