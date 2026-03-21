export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          permissions: string[]
          rate_limit_per_minute: number
          requests_count: number
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          last_used_at?: string | null
          permissions?: string[]
          rate_limit_per_minute?: number
          requests_count?: number
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          permissions?: string[]
          rate_limit_per_minute?: number
          requests_count?: number
          user_id?: string
        }
        Relationships: []
      }
      backtests: {
        Row: {
          avg_loss: number | null
          avg_win: number | null
          created_at: string
          end_date: string
          expectancy: number | null
          id: string
          is_optimization: boolean | null
          losing_trades: number | null
          loss_rate: number | null
          max_consecutive_losses: number | null
          max_consecutive_wins: number | null
          max_drawdown: number | null
          max_loss: number | null
          max_win: number | null
          min_score: number | null
          optimization_id: string | null
          patterns_filter: string[] | null
          payoff_ratio: number | null
          profit_factor: number | null
          recovery_factor: number | null
          sharpe_ratio: number | null
          sl_percent: number
          sortino_ratio: number | null
          start_date: string
          timeframe: string
          timeout_trades: number | null
          total_pnl: number | null
          total_trades: number | null
          tp_percent: number
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          avg_loss?: number | null
          avg_win?: number | null
          created_at?: string
          end_date: string
          expectancy?: number | null
          id?: string
          is_optimization?: boolean | null
          losing_trades?: number | null
          loss_rate?: number | null
          max_consecutive_losses?: number | null
          max_consecutive_wins?: number | null
          max_drawdown?: number | null
          max_loss?: number | null
          max_win?: number | null
          min_score?: number | null
          optimization_id?: string | null
          patterns_filter?: string[] | null
          payoff_ratio?: number | null
          profit_factor?: number | null
          recovery_factor?: number | null
          sharpe_ratio?: number | null
          sl_percent: number
          sortino_ratio?: number | null
          start_date: string
          timeframe: string
          timeout_trades?: number | null
          total_pnl?: number | null
          total_trades?: number | null
          tp_percent: number
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          avg_loss?: number | null
          avg_win?: number | null
          created_at?: string
          end_date?: string
          expectancy?: number | null
          id?: string
          is_optimization?: boolean | null
          losing_trades?: number | null
          loss_rate?: number | null
          max_consecutive_losses?: number | null
          max_consecutive_wins?: number | null
          max_drawdown?: number | null
          max_loss?: number | null
          max_win?: number | null
          min_score?: number | null
          optimization_id?: string | null
          patterns_filter?: string[] | null
          payoff_ratio?: number | null
          profit_factor?: number | null
          recovery_factor?: number | null
          sharpe_ratio?: number | null
          sl_percent?: number
          sortino_ratio?: number | null
          start_date?: string
          timeframe?: string
          timeout_trades?: number | null
          total_pnl?: number | null
          total_trades?: number | null
          tp_percent?: number
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: []
      }
      bot_configs: {
        Row: {
          auto_follow_signals: boolean | null
          created_at: string
          entry_amount: number | null
          entry_percent: number | null
          exchange: string
          id: string
          is_active: boolean
          leverage: number | null
          max_positions: number | null
          sl_percent: number | null
          tp_percent: number | null
          trading_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_follow_signals?: boolean | null
          created_at?: string
          entry_amount?: number | null
          entry_percent?: number | null
          exchange: string
          id?: string
          is_active?: boolean
          leverage?: number | null
          max_positions?: number | null
          sl_percent?: number | null
          tp_percent?: number | null
          trading_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_follow_signals?: boolean | null
          created_at?: string
          entry_amount?: number | null
          entry_percent?: number | null
          exchange?: string
          id?: string
          is_active?: boolean
          leverage?: number | null
          max_positions?: number | null
          sl_percent?: number | null
          tp_percent?: number | null
          trading_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_trades: {
        Row: {
          bot_config_id: string | null
          created_at: string
          direction: string
          entry_order_id: string | null
          entry_price: number
          entry_time: string | null
          exchange: string
          exit_order_id: string | null
          exit_price: number | null
          exit_reason: string | null
          exit_time: string | null
          fee_usdt: number | null
          id: string
          is_manual: boolean | null
          leverage: number | null
          notes: string | null
          order_id: string | null
          pnl_percent: number | null
          pnl_usdt: number | null
          quantity: number
          quantity_usdt: number
          signal_id: string | null
          sl_percent: number | null
          sl_price: number | null
          status: string
          symbol: string
          tp_percent: number | null
          tp_price: number | null
          trading_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_config_id?: string | null
          created_at?: string
          direction: string
          entry_order_id?: string | null
          entry_price: number
          entry_time?: string | null
          exchange: string
          exit_order_id?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          exit_time?: string | null
          fee_usdt?: number | null
          id?: string
          is_manual?: boolean | null
          leverage?: number | null
          notes?: string | null
          order_id?: string | null
          pnl_percent?: number | null
          pnl_usdt?: number | null
          quantity: number
          quantity_usdt: number
          signal_id?: string | null
          sl_percent?: number | null
          sl_price?: number | null
          status?: string
          symbol?: string
          tp_percent?: number | null
          tp_price?: number | null
          trading_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_config_id?: string | null
          created_at?: string
          direction?: string
          entry_order_id?: string | null
          entry_price?: number
          entry_time?: string | null
          exchange?: string
          exit_order_id?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          exit_time?: string | null
          fee_usdt?: number | null
          id?: string
          is_manual?: boolean | null
          leverage?: number | null
          notes?: string | null
          order_id?: string | null
          pnl_percent?: number | null
          pnl_usdt?: number | null
          quantity?: number
          quantity_usdt?: number
          signal_id?: string | null
          sl_percent?: number | null
          sl_price?: number | null
          status?: string
          symbol?: string
          tp_percent?: number | null
          tp_price?: number | null
          trading_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      btc_candles: {
        Row: {
          body_size: number | null
          close_price: number
          close_time: string
          created_at: string
          high_price: number
          id: string
          is_bullish: boolean | null
          low_price: number
          lower_wick: number | null
          open_price: number
          open_time: string
          price_change_percent: number | null
          quote_volume: number | null
          taker_buy_quote_volume: number | null
          taker_buy_volume: number | null
          timeframe: string
          trades_count: number | null
          upper_wick: number | null
          volume: number
        }
        Insert: {
          body_size?: number | null
          close_price: number
          close_time: string
          created_at?: string
          high_price: number
          id?: string
          is_bullish?: boolean | null
          low_price: number
          lower_wick?: number | null
          open_price: number
          open_time: string
          price_change_percent?: number | null
          quote_volume?: number | null
          taker_buy_quote_volume?: number | null
          taker_buy_volume?: number | null
          timeframe: string
          trades_count?: number | null
          upper_wick?: number | null
          volume: number
        }
        Update: {
          body_size?: number | null
          close_price?: number
          close_time?: string
          created_at?: string
          high_price?: number
          id?: string
          is_bullish?: boolean | null
          low_price?: number
          lower_wick?: number | null
          open_price?: number
          open_time?: string
          price_change_percent?: number | null
          quote_volume?: number | null
          taker_buy_quote_volume?: number | null
          taker_buy_volume?: number | null
          timeframe?: string
          trades_count?: number | null
          upper_wick?: number | null
          volume?: number
        }
        Relationships: []
      }
      btc_indicators: {
        Row: {
          adx_14: number | null
          atr_14: number | null
          bb_lower: number | null
          bb_middle: number | null
          bb_upper: number | null
          bb_width: number | null
          candle_id: string | null
          candle_time: string
          created_at: string
          ema_12: number | null
          ema_26: number | null
          id: string
          is_above_sma20: boolean | null
          is_above_sma200: boolean | null
          is_above_sma50: boolean | null
          is_calculated: boolean | null
          macd_histogram: number | null
          macd_line: number | null
          macd_signal: number | null
          minus_di: number | null
          plus_di: number | null
          rsi_14: number | null
          sma_20: number | null
          sma_200: number | null
          sma_50: number | null
          timeframe: string
          trend_direction: string | null
          volume_ratio: number | null
          volume_sma_20: number | null
        }
        Insert: {
          adx_14?: number | null
          atr_14?: number | null
          bb_lower?: number | null
          bb_middle?: number | null
          bb_upper?: number | null
          bb_width?: number | null
          candle_id?: string | null
          candle_time: string
          created_at?: string
          ema_12?: number | null
          ema_26?: number | null
          id?: string
          is_above_sma20?: boolean | null
          is_above_sma200?: boolean | null
          is_above_sma50?: boolean | null
          is_calculated?: boolean | null
          macd_histogram?: number | null
          macd_line?: number | null
          macd_signal?: number | null
          minus_di?: number | null
          plus_di?: number | null
          rsi_14?: number | null
          sma_20?: number | null
          sma_200?: number | null
          sma_50?: number | null
          timeframe: string
          trend_direction?: string | null
          volume_ratio?: number | null
          volume_sma_20?: number | null
        }
        Update: {
          adx_14?: number | null
          atr_14?: number | null
          bb_lower?: number | null
          bb_middle?: number | null
          bb_upper?: number | null
          bb_width?: number | null
          candle_id?: string | null
          candle_time?: string
          created_at?: string
          ema_12?: number | null
          ema_26?: number | null
          id?: string
          is_above_sma20?: boolean | null
          is_above_sma200?: boolean | null
          is_above_sma50?: boolean | null
          is_calculated?: boolean | null
          macd_histogram?: number | null
          macd_line?: number | null
          macd_signal?: number | null
          minus_di?: number | null
          plus_di?: number | null
          rsi_14?: number | null
          sma_20?: number | null
          sma_200?: number | null
          sma_50?: number | null
          timeframe?: string
          trend_direction?: string | null
          volume_ratio?: number | null
          volume_sma_20?: number | null
        }
        Relationships: []
      }
      cache_metadata: {
        Row: {
          description: string | null
          expires_at: string | null
          key: string
          last_updated: string
          value: Json
        }
        Insert: {
          description?: string | null
          expires_at?: string | null
          key: string
          last_updated?: string
          value: Json
        }
        Update: {
          description?: string | null
          expires_at?: string | null
          key?: string
          last_updated?: string
          value?: Json
        }
        Relationships: []
      }
      chart_formations: {
        Row: {
          actual_result: number | null
          created_at: string
          direction: string | null
          end_time: string | null
          entry_price: number | null
          formation_name: string
          id: string
          start_time: string
          status: string | null
          stop_loss: number | null
          target_price: number | null
          timeframe: string
          was_successful: boolean | null
        }
        Insert: {
          actual_result?: number | null
          created_at?: string
          direction?: string | null
          end_time?: string | null
          entry_price?: number | null
          formation_name: string
          id?: string
          start_time: string
          status?: string | null
          stop_loss?: number | null
          target_price?: number | null
          timeframe: string
          was_successful?: boolean | null
        }
        Update: {
          actual_result?: number | null
          created_at?: string
          direction?: string | null
          end_time?: string | null
          entry_price?: number | null
          formation_name?: string
          id?: string
          start_time?: string
          status?: string | null
          stop_loss?: number | null
          target_price?: number | null
          timeframe?: string
          was_successful?: boolean | null
        }
        Relationships: []
      }
      committee_members: {
        Row: {
          asset: string | null
          current_confidence: number
          current_direction: string
          id: string
          indicator_category: string
          indicator_name: string
          last_vote_time: string | null
          rank: number
          timeframe: string
          total_signals: number
          updated_at: string
          weight: number
          win_rate: number
        }
        Insert: {
          asset?: string | null
          current_confidence?: number
          current_direction?: string
          id?: string
          indicator_category: string
          indicator_name: string
          last_vote_time?: string | null
          rank: number
          timeframe: string
          total_signals?: number
          updated_at?: string
          weight: number
          win_rate?: number
        }
        Update: {
          asset?: string | null
          current_confidence?: number
          current_direction?: string
          id?: string
          indicator_category?: string
          indicator_name?: string
          last_vote_time?: string | null
          rank?: number
          timeframe?: string
          total_signals?: number
          updated_at?: string
          weight?: number
          win_rate?: number
        }
        Relationships: []
      }
      committee_votes: {
        Row: {
          asset: string | null
          confidence: number
          created_at: string
          id: string
          indicators_count: number
          simple_long: number
          simple_neutral: number
          simple_short: number
          simple_verdict: string
          timeframe: string
          trigger_type: string
          vote_time: string
          voted_for_timeframe: string | null
          weighted_long: number
          weighted_neutral: number
          weighted_short: number
          weighted_verdict: string
        }
        Insert: {
          asset?: string | null
          confidence?: number
          created_at?: string
          id?: string
          indicators_count?: number
          simple_long?: number
          simple_neutral?: number
          simple_short?: number
          simple_verdict: string
          timeframe: string
          trigger_type?: string
          vote_time?: string
          voted_for_timeframe?: string | null
          weighted_long?: number
          weighted_neutral?: number
          weighted_short?: number
          weighted_verdict: string
        }
        Update: {
          asset?: string | null
          confidence?: number
          created_at?: string
          id?: string
          indicators_count?: number
          simple_long?: number
          simple_neutral?: number
          simple_short?: number
          simple_verdict?: string
          timeframe?: string
          trigger_type?: string
          vote_time?: string
          voted_for_timeframe?: string | null
          weighted_long?: number
          weighted_neutral?: number
          weighted_short?: number
          weighted_verdict?: string
        }
        Relationships: []
      }
      cron_job_logs: {
        Row: {
          error_message: string | null
          execution_time_ms: number | null
          finished_at: string | null
          id: string
          job_name: string
          result: Json | null
          started_at: string
          status: string
        }
        Insert: {
          error_message?: string | null
          execution_time_ms?: number | null
          finished_at?: string | null
          id?: string
          job_name: string
          result?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          error_message?: string | null
          execution_time_ms?: number | null
          finished_at?: string | null
          id?: string
          job_name?: string
          result?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      data_sync_status: {
        Row: {
          asset: string | null
          error_message: string | null
          id: string
          last_synced_time: string | null
          sync_status: string | null
          timeframe: string
          total_candles: number | null
          total_patterns: number | null
          updated_at: string
        }
        Insert: {
          asset?: string | null
          error_message?: string | null
          id?: string
          last_synced_time?: string | null
          sync_status?: string | null
          timeframe: string
          total_candles?: number | null
          total_patterns?: number | null
          updated_at?: string
        }
        Update: {
          asset?: string | null
          error_message?: string | null
          id?: string
          last_synced_time?: string | null
          sync_status?: string | null
          timeframe?: string
          total_candles?: number | null
          total_patterns?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      detected_patterns: {
        Row: {
          atr_score: number | null
          bb_score: number | null
          candle_id: string | null
          created_at: string
          direction: string | null
          id: string
          is_tradeable: boolean | null
          macd_score: number | null
          near_resistance: boolean | null
          near_support: boolean | null
          pattern_name: string
          pattern_time: string
          pattern_type: string
          price_at_pattern: number | null
          result_after_1h: number | null
          result_after_24h: number | null
          result_after_4h: number | null
          result_direction: string | null
          rsi_at_pattern: number | null
          rsi_score: number | null
          signal_score: number | null
          sr_score: number | null
          strength: number | null
          timeframe: string
          trend_score: number | null
          volume_at_pattern: number | null
          volume_score: number | null
          was_successful: boolean | null
        }
        Insert: {
          atr_score?: number | null
          bb_score?: number | null
          candle_id?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          is_tradeable?: boolean | null
          macd_score?: number | null
          near_resistance?: boolean | null
          near_support?: boolean | null
          pattern_name: string
          pattern_time: string
          pattern_type: string
          price_at_pattern?: number | null
          result_after_1h?: number | null
          result_after_24h?: number | null
          result_after_4h?: number | null
          result_direction?: string | null
          rsi_at_pattern?: number | null
          rsi_score?: number | null
          signal_score?: number | null
          sr_score?: number | null
          strength?: number | null
          timeframe: string
          trend_score?: number | null
          volume_at_pattern?: number | null
          volume_score?: number | null
          was_successful?: boolean | null
        }
        Update: {
          atr_score?: number | null
          bb_score?: number | null
          candle_id?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          is_tradeable?: boolean | null
          macd_score?: number | null
          near_resistance?: boolean | null
          near_support?: boolean | null
          pattern_name?: string
          pattern_time?: string
          pattern_type?: string
          price_at_pattern?: number | null
          result_after_1h?: number | null
          result_after_24h?: number | null
          result_after_4h?: number | null
          result_direction?: string | null
          rsi_at_pattern?: number | null
          rsi_score?: number | null
          signal_score?: number | null
          sr_score?: number | null
          strength?: number | null
          timeframe?: string
          trend_score?: number | null
          volume_at_pattern?: number | null
          volume_score?: number | null
          was_successful?: boolean | null
        }
        Relationships: []
      }
      eth_candles: {
        Row: {
          close_price: number
          close_time: string
          created_at: string
          high_price: number
          id: string
          low_price: number
          open_price: number
          open_time: string
          quote_volume: number
          taker_buy_quote_volume: number | null
          taker_buy_volume: number | null
          timeframe: string
          trades_count: number | null
          volume: number
        }
        Insert: {
          close_price: number
          close_time: string
          created_at?: string
          high_price: number
          id?: string
          low_price: number
          open_price: number
          open_time: string
          quote_volume?: number
          taker_buy_quote_volume?: number | null
          taker_buy_volume?: number | null
          timeframe: string
          trades_count?: number | null
          volume: number
        }
        Update: {
          close_price?: number
          close_time?: string
          created_at?: string
          high_price?: number
          id?: string
          low_price?: number
          open_price?: number
          open_time?: string
          quote_volume?: number
          taker_buy_quote_volume?: number | null
          taker_buy_volume?: number | null
          timeframe?: string
          trades_count?: number | null
          volume?: number
        }
        Relationships: []
      }
      indicator_signals: {
        Row: {
          asset: string | null
          created_at: string
          direction: string
          entry_price: number
          exit_price: number | null
          exit_time: string | null
          id: string
          indicator_category: string
          indicator_details: Json | null
          indicator_name: string
          indicator_value: number | null
          pnl_percent: number | null
          signal_time: string
          sl_percent: number | null
          sl_price: number | null
          status: string | null
          timeframe: string | null
          tp_percent: number | null
          tp_price: number | null
        }
        Insert: {
          asset?: string | null
          created_at?: string
          direction: string
          entry_price: number
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          indicator_category: string
          indicator_details?: Json | null
          indicator_name: string
          indicator_value?: number | null
          pnl_percent?: number | null
          signal_time: string
          sl_percent?: number | null
          sl_price?: number | null
          status?: string | null
          timeframe?: string | null
          tp_percent?: number | null
          tp_price?: number | null
        }
        Update: {
          asset?: string | null
          created_at?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          indicator_category?: string
          indicator_details?: Json | null
          indicator_name?: string
          indicator_value?: number | null
          pnl_percent?: number | null
          signal_time?: string
          sl_percent?: number | null
          sl_price?: number | null
          status?: string | null
          timeframe?: string | null
          tp_percent?: number | null
          tp_price?: number | null
        }
        Relationships: []
      }
      indicator_stats: {
        Row: {
          asset: string | null
          avg_pnl: number | null
          best_pnl: number | null
          best_streak: number | null
          current_streak: number | null
          id: string
          indicator_category: string
          indicator_name: string
          last_signal_direction: string | null
          last_signal_result: string | null
          last_signal_time: string | null
          losing_signals: number | null
          timeframe: string | null
          timeout_signals: number | null
          total_pnl: number | null
          total_signals: number | null
          updated_at: string
          win_rate: number | null
          winning_signals: number | null
          worst_pnl: number | null
        }
        Insert: {
          asset?: string | null
          avg_pnl?: number | null
          best_pnl?: number | null
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          indicator_category: string
          indicator_name: string
          last_signal_direction?: string | null
          last_signal_result?: string | null
          last_signal_time?: string | null
          losing_signals?: number | null
          timeframe?: string | null
          timeout_signals?: number | null
          total_pnl?: number | null
          total_signals?: number | null
          updated_at?: string
          win_rate?: number | null
          winning_signals?: number | null
          worst_pnl?: number | null
        }
        Update: {
          asset?: string | null
          avg_pnl?: number | null
          best_pnl?: number | null
          best_streak?: number | null
          current_streak?: number | null
          id?: string
          indicator_category?: string
          indicator_name?: string
          last_signal_direction?: string | null
          last_signal_result?: string | null
          last_signal_time?: string | null
          losing_signals?: number | null
          timeframe?: string | null
          timeout_signals?: number | null
          total_pnl?: number | null
          total_signals?: number | null
          updated_at?: string
          win_rate?: number | null
          winning_signals?: number | null
          worst_pnl?: number | null
        }
        Relationships: []
      }
      live_positions: {
        Row: {
          atr_at_entry: number | null
          created_at: string
          duration_minutes: number | null
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          exit_type: string | null
          id: string
          is_simulated: boolean | null
          macd_at_entry: number | null
          notes: string | null
          pattern_direction: string
          pattern_id: string | null
          pattern_name: string
          pnl_amount: number | null
          pnl_percent: number | null
          position_size: number | null
          rsi_at_entry: number | null
          signal_score: number | null
          signal_time: string
          sl_percent: number
          sl_price: number
          status: string | null
          timeframe: string
          tp_percent: number
          tp_price: number
          trend_at_entry: string | null
          updated_at: string
        }
        Insert: {
          atr_at_entry?: number | null
          created_at?: string
          duration_minutes?: number | null
          entry_price: number
          entry_time: string
          exit_price?: number | null
          exit_time?: string | null
          exit_type?: string | null
          id?: string
          is_simulated?: boolean | null
          macd_at_entry?: number | null
          notes?: string | null
          pattern_direction: string
          pattern_id?: string | null
          pattern_name: string
          pnl_amount?: number | null
          pnl_percent?: number | null
          position_size?: number | null
          rsi_at_entry?: number | null
          signal_score?: number | null
          signal_time: string
          sl_percent: number
          sl_price: number
          status?: string | null
          timeframe: string
          tp_percent: number
          tp_price: number
          trend_at_entry?: string | null
          updated_at?: string
        }
        Update: {
          atr_at_entry?: number | null
          created_at?: string
          duration_minutes?: number | null
          entry_price?: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          exit_type?: string | null
          id?: string
          is_simulated?: boolean | null
          macd_at_entry?: number | null
          notes?: string | null
          pattern_direction?: string
          pattern_id?: string | null
          pattern_name?: string
          pnl_amount?: number | null
          pnl_percent?: number | null
          position_size?: number | null
          rsi_at_entry?: number | null
          signal_score?: number | null
          signal_time?: string
          sl_percent?: number
          sl_price?: number
          status?: string | null
          timeframe?: string
          tp_percent?: number
          tp_price?: number
          trend_at_entry?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ml_feature_store: {
        Row: {
          above_sma20: boolean | null
          above_sma200: boolean | null
          above_sma50: boolean | null
          adx_14: number | null
          atr_14: number | null
          atr_percent: number | null
          bb_position: number | null
          bb_width: number | null
          confidence: number | null
          created_at: string
          day_of_week: number | null
          direction: string
          dist_ema12: number | null
          dist_ema26: number | null
          dist_sma20: number | null
          dist_sma200: number | null
          dist_sma50: number | null
          entry_price: number
          exit_reason: string | null
          filters_passed: number | null
          final_pnl_net: number | null
          funding_rate: number | null
          hold_duration_hours: number | null
          hour_of_day: number | null
          id: string
          is_win: boolean | null
          long_short_ratio: number | null
          macd_histogram: number | null
          macd_line: number | null
          macd_signal: number | null
          max_adverse_excursion: number | null
          max_favorable_excursion: number | null
          memory_confidence: number | null
          minus_di: number | null
          minutes_since_last_signal: number | null
          ml_weight: number | null
          open_interest_delta: number | null
          outcome_1h: number | null
          outcome_24h: number | null
          outcome_4h: number | null
          plus_di: number | null
          rsi_14: number | null
          signal_id: string
          signal_score: number | null
          strategy_name: string
          taker_buy_ratio: number | null
          timeframe: string | null
          total_filters: number | null
          trend_direction: string | null
          updated_at: string
          volume_ratio: number | null
        }
        Insert: {
          above_sma20?: boolean | null
          above_sma200?: boolean | null
          above_sma50?: boolean | null
          adx_14?: number | null
          atr_14?: number | null
          atr_percent?: number | null
          bb_position?: number | null
          bb_width?: number | null
          confidence?: number | null
          created_at?: string
          day_of_week?: number | null
          direction: string
          dist_ema12?: number | null
          dist_ema26?: number | null
          dist_sma20?: number | null
          dist_sma200?: number | null
          dist_sma50?: number | null
          entry_price: number
          exit_reason?: string | null
          filters_passed?: number | null
          final_pnl_net?: number | null
          funding_rate?: number | null
          hold_duration_hours?: number | null
          hour_of_day?: number | null
          id?: string
          is_win?: boolean | null
          long_short_ratio?: number | null
          macd_histogram?: number | null
          macd_line?: number | null
          macd_signal?: number | null
          max_adverse_excursion?: number | null
          max_favorable_excursion?: number | null
          memory_confidence?: number | null
          minus_di?: number | null
          minutes_since_last_signal?: number | null
          ml_weight?: number | null
          open_interest_delta?: number | null
          outcome_1h?: number | null
          outcome_24h?: number | null
          outcome_4h?: number | null
          plus_di?: number | null
          rsi_14?: number | null
          signal_id: string
          signal_score?: number | null
          strategy_name: string
          taker_buy_ratio?: number | null
          timeframe?: string | null
          total_filters?: number | null
          trend_direction?: string | null
          updated_at?: string
          volume_ratio?: number | null
        }
        Update: {
          above_sma20?: boolean | null
          above_sma200?: boolean | null
          above_sma50?: boolean | null
          adx_14?: number | null
          atr_14?: number | null
          atr_percent?: number | null
          bb_position?: number | null
          bb_width?: number | null
          confidence?: number | null
          created_at?: string
          day_of_week?: number | null
          direction?: string
          dist_ema12?: number | null
          dist_ema26?: number | null
          dist_sma20?: number | null
          dist_sma200?: number | null
          dist_sma50?: number | null
          entry_price?: number
          exit_reason?: string | null
          filters_passed?: number | null
          final_pnl_net?: number | null
          funding_rate?: number | null
          hold_duration_hours?: number | null
          hour_of_day?: number | null
          id?: string
          is_win?: boolean | null
          long_short_ratio?: number | null
          macd_histogram?: number | null
          macd_line?: number | null
          macd_signal?: number | null
          max_adverse_excursion?: number | null
          max_favorable_excursion?: number | null
          memory_confidence?: number | null
          minus_di?: number | null
          minutes_since_last_signal?: number | null
          ml_weight?: number | null
          open_interest_delta?: number | null
          outcome_1h?: number | null
          outcome_24h?: number | null
          outcome_4h?: number | null
          plus_di?: number | null
          rsi_14?: number | null
          signal_id?: string
          signal_score?: number | null
          strategy_name?: string
          taker_buy_ratio?: number | null
          timeframe?: string | null
          total_filters?: number | null
          trend_direction?: string | null
          updated_at?: string
          volume_ratio?: number | null
        }
        Relationships: []
      }
      ml_position_timeline: {
        Row: {
          created_at: string
          current_price: number
          direction: string
          entry_price: number
          funding_rate: number | null
          hours_since_entry: number
          id: string
          macd_histogram: number | null
          mae_so_far: number | null
          mfe_so_far: number | null
          pnl_1x: number
          pnl_leveraged: number
          pnl_net: number
          rsi_14: number | null
          signal_id: string
          snapshot_time: string
          strategy_name: string
          volume_ratio: number | null
        }
        Insert: {
          created_at?: string
          current_price: number
          direction: string
          entry_price: number
          funding_rate?: number | null
          hours_since_entry: number
          id?: string
          macd_histogram?: number | null
          mae_so_far?: number | null
          mfe_so_far?: number | null
          pnl_1x: number
          pnl_leveraged: number
          pnl_net: number
          rsi_14?: number | null
          signal_id: string
          snapshot_time?: string
          strategy_name: string
          volume_ratio?: number | null
        }
        Update: {
          created_at?: string
          current_price?: number
          direction?: string
          entry_price?: number
          funding_rate?: number | null
          hours_since_entry?: number
          id?: string
          macd_histogram?: number | null
          mae_so_far?: number | null
          mfe_so_far?: number | null
          pnl_1x?: number
          pnl_leveraged?: number
          pnl_net?: number
          rsi_14?: number | null
          signal_id?: string
          snapshot_time?: string
          strategy_name?: string
          volume_ratio?: number | null
        }
        Relationships: []
      }
      ml_strategy_weights: {
        Row: {
          avg_pnl: number
          closed_signals: number
          confidence_score: number
          created_at: string
          id: string
          losses: number
          profit_factor: number
          sharpe_score: number
          strategy_name: string
          total_signals: number
          training_iteration: number
          updated_at: string
          weight: number
          win_rate: number
          wins: number
        }
        Insert: {
          avg_pnl?: number
          closed_signals?: number
          confidence_score?: number
          created_at?: string
          id?: string
          losses?: number
          profit_factor?: number
          sharpe_score?: number
          strategy_name: string
          total_signals?: number
          training_iteration?: number
          updated_at?: string
          weight?: number
          win_rate?: number
          wins?: number
        }
        Update: {
          avg_pnl?: number
          closed_signals?: number
          confidence_score?: number
          created_at?: string
          id?: string
          losses?: number
          profit_factor?: number
          sharpe_score?: number
          strategy_name?: string
          total_signals?: number
          training_iteration?: number
          updated_at?: string
          weight?: number
          win_rate?: number
          wins?: number
        }
        Relationships: []
      }
      ml_weight_history: {
        Row: {
          created_at: string
          id: string
          iteration: number
          reason: string | null
          strategy_name: string
          weight_after: number
          weight_before: number
          win_rate: number
        }
        Insert: {
          created_at?: string
          id?: string
          iteration?: number
          reason?: string | null
          strategy_name: string
          weight_after?: number
          weight_before?: number
          win_rate?: number
        }
        Update: {
          created_at?: string
          id?: string
          iteration?: number
          reason?: string | null
          strategy_name?: string
          weight_after?: number
          weight_before?: number
          win_rate?: number
        }
        Relationships: []
      }
      optimizations: {
        Row: {
          best_expectancy: number | null
          best_profit_factor: number | null
          best_sl: number | null
          best_tp: number | null
          best_win_rate: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          optimization_period_days: number
          sl_max: number
          sl_min: number
          sl_step: number
          started_at: string | null
          status: string | null
          timeframe: string
          total_combinations_tested: number | null
          total_trades_in_best: number | null
          tp_max: number
          tp_min: number
          tp_step: number
        }
        Insert: {
          best_expectancy?: number | null
          best_profit_factor?: number | null
          best_sl?: number | null
          best_tp?: number | null
          best_win_rate?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          optimization_period_days: number
          sl_max: number
          sl_min: number
          sl_step: number
          started_at?: string | null
          status?: string | null
          timeframe: string
          total_combinations_tested?: number | null
          total_trades_in_best?: number | null
          tp_max: number
          tp_min: number
          tp_step: number
        }
        Update: {
          best_expectancy?: number | null
          best_profit_factor?: number | null
          best_sl?: number | null
          best_tp?: number | null
          best_win_rate?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          optimization_period_days?: number
          sl_max?: number
          sl_min?: number
          sl_step?: number
          started_at?: string | null
          status?: string | null
          timeframe?: string
          total_combinations_tested?: number | null
          total_trades_in_best?: number | null
          tp_max?: number
          tp_min?: number
          tp_step?: number
        }
        Relationships: []
      }
      pattern_fingerprints: {
        Row: {
          created_at: string | null
          end_price: number
          end_time: string
          fingerprint: Json
          id: string
          outcome_24h_pct: number | null
          outcome_4h_pct: number | null
          outcome_7d_pct: number | null
          outcome_direction: string | null
          price_change_pct: number | null
          start_price: number
          start_time: string
          timeframe: string
          window_size: number
        }
        Insert: {
          created_at?: string | null
          end_price: number
          end_time: string
          fingerprint: Json
          id?: string
          outcome_24h_pct?: number | null
          outcome_4h_pct?: number | null
          outcome_7d_pct?: number | null
          outcome_direction?: string | null
          price_change_pct?: number | null
          start_price: number
          start_time: string
          timeframe: string
          window_size: number
        }
        Update: {
          created_at?: string | null
          end_price?: number
          end_time?: string
          fingerprint?: Json
          id?: string
          outcome_24h_pct?: number | null
          outcome_4h_pct?: number | null
          outcome_7d_pct?: number | null
          outcome_direction?: string | null
          price_change_pct?: number | null
          start_price?: number
          start_time?: string
          timeframe?: string
          window_size?: number
        }
        Relationships: []
      }
      pattern_matches: {
        Row: {
          confidence: number | null
          created_at: string | null
          current_end_time: string
          dtw_distance: number | null
          historical_outcome_direction: string | null
          historical_outcome_pct: number | null
          id: string
          match_end_time: string | null
          match_fingerprint_id: string | null
          match_start_time: string | null
          predicted_direction: string | null
          signal_id: string | null
          similarity_score: number
          telegram_sent: boolean | null
          timeframe: string
          window_size: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          current_end_time: string
          dtw_distance?: number | null
          historical_outcome_direction?: string | null
          historical_outcome_pct?: number | null
          id?: string
          match_end_time?: string | null
          match_fingerprint_id?: string | null
          match_start_time?: string | null
          predicted_direction?: string | null
          signal_id?: string | null
          similarity_score: number
          telegram_sent?: boolean | null
          timeframe: string
          window_size: number
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          current_end_time?: string
          dtw_distance?: number | null
          historical_outcome_direction?: string | null
          historical_outcome_pct?: number | null
          id?: string
          match_end_time?: string | null
          match_fingerprint_id?: string | null
          match_start_time?: string | null
          predicted_direction?: string | null
          signal_id?: string | null
          similarity_score?: number
          telegram_sent?: boolean | null
          timeframe?: string
          window_size?: number
        }
        Relationships: []
      }
      pattern_statistics: {
        Row: {
          avg_result_1h: number | null
          avg_result_24h: number | null
          avg_result_4h: number | null
          best_result: number | null
          failed_count: number | null
          id: string
          last_occurrence: string | null
          pattern_name: string
          successful_count: number | null
          timeframe: string
          total_occurrences: number | null
          updated_at: string
          win_rate: number | null
          worst_result: number | null
        }
        Insert: {
          avg_result_1h?: number | null
          avg_result_24h?: number | null
          avg_result_4h?: number | null
          best_result?: number | null
          failed_count?: number | null
          id?: string
          last_occurrence?: string | null
          pattern_name: string
          successful_count?: number | null
          timeframe: string
          total_occurrences?: number | null
          updated_at?: string
          win_rate?: number | null
          worst_result?: number | null
        }
        Update: {
          avg_result_1h?: number | null
          avg_result_24h?: number | null
          avg_result_4h?: number | null
          best_result?: number | null
          failed_count?: number | null
          id?: string
          last_occurrence?: string | null
          pattern_name?: string
          successful_count?: number | null
          timeframe?: string
          total_occurrences?: number | null
          updated_at?: string
          win_rate?: number | null
          worst_result?: number | null
        }
        Relationships: []
      }
      prediction_accuracy_stats: {
        Row: {
          accuracy_percent: number | null
          avg_error_minutes: number | null
          best_streak: number | null
          correct_predictions: number
          current_streak: number | null
          exchange: string
          id: string
          last_updated: string
          prediction_type: string
          symbol: string | null
          total_predictions: number
        }
        Insert: {
          accuracy_percent?: number | null
          avg_error_minutes?: number | null
          best_streak?: number | null
          correct_predictions?: number
          current_streak?: number | null
          exchange: string
          id?: string
          last_updated?: string
          prediction_type?: string
          symbol?: string | null
          total_predictions?: number
        }
        Update: {
          accuracy_percent?: number | null
          avg_error_minutes?: number | null
          best_streak?: number | null
          correct_predictions?: number
          current_streak?: number | null
          exchange?: string
          id?: string
          last_updated?: string
          prediction_type?: string
          symbol?: string | null
          total_predictions?: number
        }
        Relationships: []
      }
      price_levels: {
        Row: {
          break_attempts: number | null
          broken_at: string | null
          created_at: string
          first_touch: string
          id: string
          is_broken: boolean | null
          last_touch: string
          level_type: string
          price_level: number
          strength: number | null
          successful_bounces: number | null
          timeframe: string
          touch_count: number | null
          updated_at: string
        }
        Insert: {
          break_attempts?: number | null
          broken_at?: string | null
          created_at?: string
          first_touch: string
          id?: string
          is_broken?: boolean | null
          last_touch: string
          level_type: string
          price_level: number
          strength?: number | null
          successful_bounces?: number | null
          timeframe: string
          touch_count?: number | null
          updated_at?: string
        }
        Update: {
          break_attempts?: number | null
          broken_at?: string | null
          created_at?: string
          first_touch?: string
          id?: string
          is_broken?: boolean | null
          last_touch?: string
          level_type?: string
          price_level?: number
          strength?: number | null
          successful_bounces?: number | null
          timeframe?: string
          touch_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      price_snapshots: {
        Row: {
          created_at: string
          exchange: string
          id: string
          price: number
          symbol: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          exchange: string
          id?: string
          price: number
          symbol: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          exchange?: string
          id?: string
          price?: number
          symbol?: string
          timestamp?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pump_alerts: {
        Row: {
          actual_change_percent: number | null
          confirmation_level: number
          created_at: string
          detected_at: string
          exchange: string
          id: string
          ml_confidence: number | null
          ml_score: number | null
          new_price: number
          old_price: number
          predicted_for: string | null
          prediction_accuracy: number | null
          price_change_percent: number
          symbol: string
          verified_at: string | null
          was_correct: boolean | null
        }
        Insert: {
          actual_change_percent?: number | null
          confirmation_level?: number
          created_at?: string
          detected_at?: string
          exchange: string
          id?: string
          ml_confidence?: number | null
          ml_score?: number | null
          new_price: number
          old_price: number
          predicted_for?: string | null
          prediction_accuracy?: number | null
          price_change_percent: number
          symbol: string
          verified_at?: string | null
          was_correct?: boolean | null
        }
        Update: {
          actual_change_percent?: number | null
          confirmation_level?: number
          created_at?: string
          detected_at?: string
          exchange?: string
          id?: string
          ml_confidence?: number | null
          ml_score?: number | null
          new_price?: number
          old_price?: number
          predicted_for?: string | null
          prediction_accuracy?: number | null
          price_change_percent?: number
          symbol?: string
          verified_at?: string | null
          was_correct?: boolean | null
        }
        Relationships: []
      }
      pump_details: {
        Row: {
          avg_trade_size: number | null
          change_percent: number
          created_at: string
          day_of_week: string | null
          duration_seconds: number
          end_price: number
          end_time: string
          estimated_traders: number | null
          estimated_volume_usdt: number | null
          event_type: string
          exchange: string
          fall_duration_seconds: number
          hour_of_day: number | null
          id: string
          is_recurring: boolean
          max_change_percent: number
          peak_activity_period: string | null
          peak_price: number
          peak_time: string
          pump_alert_id: string
          start_price: number
          start_time: string
          symbol: string
          time_to_peak_seconds: number
        }
        Insert: {
          avg_trade_size?: number | null
          change_percent: number
          created_at?: string
          day_of_week?: string | null
          duration_seconds: number
          end_price: number
          end_time: string
          estimated_traders?: number | null
          estimated_volume_usdt?: number | null
          event_type: string
          exchange: string
          fall_duration_seconds: number
          hour_of_day?: number | null
          id?: string
          is_recurring?: boolean
          max_change_percent: number
          peak_activity_period?: string | null
          peak_price: number
          peak_time: string
          pump_alert_id: string
          start_price: number
          start_time: string
          symbol: string
          time_to_peak_seconds: number
        }
        Update: {
          avg_trade_size?: number | null
          change_percent?: number
          created_at?: string
          day_of_week?: string | null
          duration_seconds?: number
          end_price?: number
          end_time?: string
          estimated_traders?: number | null
          estimated_volume_usdt?: number | null
          event_type?: string
          exchange?: string
          fall_duration_seconds?: number
          hour_of_day?: number | null
          id?: string
          is_recurring?: boolean
          max_change_percent?: number
          peak_activity_period?: string | null
          peak_price?: number
          peak_time?: string
          pump_alert_id?: string
          start_price?: number
          start_time?: string
          symbol?: string
          time_to_peak_seconds?: number
        }
        Relationships: []
      }
      pump_events: {
        Row: {
          base_asset: string
          created_at: string
          day_of_week: number
          detected_at: string
          exchange: string
          hour_of_day: number
          id: string
          price_after: number
          price_before: number
          price_change_percent: number
          quote_asset: string
          symbol: string
        }
        Insert: {
          base_asset: string
          created_at?: string
          day_of_week: number
          detected_at?: string
          exchange: string
          hour_of_day: number
          id?: string
          price_after: number
          price_before: number
          price_change_percent: number
          quote_asset: string
          symbol: string
        }
        Update: {
          base_asset?: string
          created_at?: string
          day_of_week?: number
          detected_at?: string
          exchange?: string
          hour_of_day?: number
          id?: string
          price_after?: number
          price_before?: number
          price_change_percent?: number
          quote_asset?: string
          symbol?: string
        }
        Relationships: []
      }
      pump_patterns: {
        Row: {
          avg_price_change: number
          base_asset: string
          confidence_level: number
          created_at: string
          day_of_week: number | null
          exchange: string
          first_occurrence: string
          hour_of_day: number | null
          id: string
          last_occurrence: string
          occurrence_count: number
          quote_asset: string
          symbol: string
          updated_at: string
        }
        Insert: {
          avg_price_change: number
          base_asset: string
          confidence_level?: number
          created_at?: string
          day_of_week?: number | null
          exchange: string
          first_occurrence: string
          hour_of_day?: number | null
          id?: string
          last_occurrence: string
          occurrence_count?: number
          quote_asset: string
          symbol: string
          updated_at?: string
        }
        Update: {
          avg_price_change?: number
          base_asset?: string
          confidence_level?: number
          created_at?: string
          day_of_week?: number | null
          exchange?: string
          first_occurrence?: string
          hour_of_day?: number | null
          id?: string
          last_occurrence?: string
          occurrence_count?: number
          quote_asset?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      pump_predictions: {
        Row: {
          actual_change_percent: number | null
          created_at: string
          error_minutes: number | null
          exchange: string
          id: string
          matched_alert_id: string | null
          notes: string | null
          predicted_change_percent: number | null
          predicted_for: string
          prediction_type: string
          source: string | null
          symbol: string
          verified_at: string | null
          was_correct: boolean | null
          window_minutes: number
        }
        Insert: {
          actual_change_percent?: number | null
          created_at?: string
          error_minutes?: number | null
          exchange: string
          id?: string
          matched_alert_id?: string | null
          notes?: string | null
          predicted_change_percent?: number | null
          predicted_for: string
          prediction_type?: string
          source?: string | null
          symbol: string
          verified_at?: string | null
          was_correct?: boolean | null
          window_minutes?: number
        }
        Update: {
          actual_change_percent?: number | null
          created_at?: string
          error_minutes?: number | null
          exchange?: string
          id?: string
          matched_alert_id?: string | null
          notes?: string | null
          predicted_change_percent?: number | null
          predicted_for?: string
          prediction_type?: string
          source?: string | null
          symbol?: string
          verified_at?: string | null
          was_correct?: boolean | null
          window_minutes?: number
        }
        Relationships: []
      }
      pump_statistics: {
        Row: {
          avg_dump_percent: number
          avg_prediction_error_hours: number | null
          avg_pump_percent: number
          consistency_score: number | null
          created_at: string
          day_of_week: string | null
          exchange: string
          historical_accuracy: number | null
          hour_of_day: number | null
          id: string
          is_recurring: boolean
          last_dump_at: string | null
          last_pump_at: string | null
          last_verified_at: string | null
          ml_score: number | null
          predicted_next_pump: string | null
          prediction_confidence: number | null
          predictions_correct: number | null
          predictions_made: number | null
          pump_velocity: number | null
          symbol: string
          total_dumps: number
          total_pumps: number
          updated_at: string
        }
        Insert: {
          avg_dump_percent?: number
          avg_prediction_error_hours?: number | null
          avg_pump_percent?: number
          consistency_score?: number | null
          created_at?: string
          day_of_week?: string | null
          exchange: string
          historical_accuracy?: number | null
          hour_of_day?: number | null
          id?: string
          is_recurring?: boolean
          last_dump_at?: string | null
          last_pump_at?: string | null
          last_verified_at?: string | null
          ml_score?: number | null
          predicted_next_pump?: string | null
          prediction_confidence?: number | null
          predictions_correct?: number | null
          predictions_made?: number | null
          pump_velocity?: number | null
          symbol: string
          total_dumps?: number
          total_pumps?: number
          updated_at?: string
        }
        Update: {
          avg_dump_percent?: number
          avg_prediction_error_hours?: number | null
          avg_pump_percent?: number
          consistency_score?: number | null
          created_at?: string
          day_of_week?: string | null
          exchange?: string
          historical_accuracy?: number | null
          hour_of_day?: number | null
          id?: string
          is_recurring?: boolean
          last_dump_at?: string | null
          last_pump_at?: string | null
          last_verified_at?: string | null
          ml_score?: number | null
          predicted_next_pump?: string | null
          prediction_confidence?: number | null
          predictions_correct?: number | null
          predictions_made?: number | null
          pump_velocity?: number | null
          symbol?: string
          total_dumps?: number
          total_pumps?: number
          updated_at?: string
        }
        Relationships: []
      }
      scanner_logs: {
        Row: {
          created_at: string
          error_message: string | null
          exchange: string | null
          fetch_time_ms: number | null
          id: string
          metadata: Json | null
          pumps_detected: number | null
          pumps_saved: number | null
          scanner_type: string
          threshold: number | null
          tickers_scanned: number | null
          total_time_ms: number | null
          window_seconds: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          exchange?: string | null
          fetch_time_ms?: number | null
          id?: string
          metadata?: Json | null
          pumps_detected?: number | null
          pumps_saved?: number | null
          scanner_type: string
          threshold?: number | null
          tickers_scanned?: number | null
          total_time_ms?: number | null
          window_seconds?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          exchange?: string | null
          fetch_time_ms?: number | null
          id?: string
          metadata?: Json | null
          pumps_detected?: number | null
          pumps_saved?: number | null
          scanner_type?: string
          threshold?: number | null
          tickers_scanned?: number | null
          total_time_ms?: number | null
          window_seconds?: number | null
        }
        Relationships: []
      }
      scanner_metrics: {
        Row: {
          accuracy_percent: number | null
          avg_latency_ms: number | null
          avg_ml_score: number | null
          created_at: string | null
          hour: string
          id: string
          predictions_correct: number | null
          predictions_verified: number | null
          pumps_found: number | null
          pumps_saved: number | null
          scanner_type: string
          total_scans: number | null
        }
        Insert: {
          accuracy_percent?: number | null
          avg_latency_ms?: number | null
          avg_ml_score?: number | null
          created_at?: string | null
          hour: string
          id?: string
          predictions_correct?: number | null
          predictions_verified?: number | null
          pumps_found?: number | null
          pumps_saved?: number | null
          scanner_type?: string
          total_scans?: number | null
        }
        Update: {
          accuracy_percent?: number | null
          avg_latency_ms?: number | null
          avg_ml_score?: number | null
          created_at?: string | null
          hour?: string
          id?: string
          predictions_correct?: number | null
          predictions_verified?: number | null
          pumps_found?: number | null
          pumps_saved?: number | null
          scanner_type?: string
          total_scans?: number | null
        }
        Relationships: []
      }
      selenium_configs: {
        Row: {
          auto_execute_trades: boolean | null
          chart_urls: string[] | null
          created_at: string
          id: string
          indicators: string[] | null
          is_active: boolean | null
          last_error: string | null
          last_sync_at: string | null
          min_signal_score: number | null
          scan_interval_seconds: number | null
          service_url: string
          symbols: string[] | null
          sync_status: string | null
          timeframes: string[] | null
          tv_email: string | null
          tv_password_hint: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_execute_trades?: boolean | null
          chart_urls?: string[] | null
          created_at?: string
          id?: string
          indicators?: string[] | null
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          min_signal_score?: number | null
          scan_interval_seconds?: number | null
          service_url?: string
          symbols?: string[] | null
          sync_status?: string | null
          timeframes?: string[] | null
          tv_email?: string | null
          tv_password_hint?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_execute_trades?: boolean | null
          chart_urls?: string[] | null
          created_at?: string
          id?: string
          indicators?: string[] | null
          is_active?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          min_signal_score?: number | null
          scan_interval_seconds?: number | null
          service_url?: string
          symbols?: string[] | null
          sync_status?: string | null
          timeframes?: string[] | null
          tv_email?: string | null
          tv_password_hint?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signal_history: {
        Row: {
          bear_score: number | null
          bull_score: number | null
          closed_at: string | null
          confidence: number | null
          created_at: string
          direction: string
          entry_price: number
          exit_price: number | null
          filters_passed: number | null
          id: string
          indicator_name: string
          notes: string | null
          pnl_125x: number | null
          pnl_percent: number | null
          signal_score: number | null
          signal_type: string
          sl_percent: number | null
          sl_price: number | null
          status: string | null
          telegram_sent: boolean | null
          telegram_sent_at: string | null
          timeframe: string | null
          total_filters: number | null
          tp_percent: number | null
          tp_price: number | null
        }
        Insert: {
          bear_score?: number | null
          bull_score?: number | null
          closed_at?: string | null
          confidence?: number | null
          created_at?: string
          direction: string
          entry_price: number
          exit_price?: number | null
          filters_passed?: number | null
          id?: string
          indicator_name: string
          notes?: string | null
          pnl_125x?: number | null
          pnl_percent?: number | null
          signal_score?: number | null
          signal_type: string
          sl_percent?: number | null
          sl_price?: number | null
          status?: string | null
          telegram_sent?: boolean | null
          telegram_sent_at?: string | null
          timeframe?: string | null
          total_filters?: number | null
          tp_percent?: number | null
          tp_price?: number | null
        }
        Update: {
          bear_score?: number | null
          bull_score?: number | null
          closed_at?: string | null
          confidence?: number | null
          created_at?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          filters_passed?: number | null
          id?: string
          indicator_name?: string
          notes?: string | null
          pnl_125x?: number | null
          pnl_percent?: number | null
          signal_score?: number | null
          signal_type?: string
          sl_percent?: number | null
          sl_price?: number | null
          status?: string | null
          telegram_sent?: boolean | null
          telegram_sent_at?: string | null
          timeframe?: string | null
          total_filters?: number | null
          tp_percent?: number | null
          tp_price?: number | null
        }
        Relationships: []
      }
      sr_events: {
        Row: {
          created_at: string
          distance_from_level: number | null
          event_time: string
          event_type: string
          id: string
          level_id: string | null
          macd_at_event: number | null
          pattern_at_event: string | null
          price_at_event: number
          result_direction: string | null
          result_pnl_1h: number | null
          result_pnl_4h: number | null
          rsi_at_event: number | null
          timeframe: string
          volume_at_event: number | null
        }
        Insert: {
          created_at?: string
          distance_from_level?: number | null
          event_time: string
          event_type: string
          id?: string
          level_id?: string | null
          macd_at_event?: number | null
          pattern_at_event?: string | null
          price_at_event: number
          result_direction?: string | null
          result_pnl_1h?: number | null
          result_pnl_4h?: number | null
          rsi_at_event?: number | null
          timeframe: string
          volume_at_event?: number | null
        }
        Update: {
          created_at?: string
          distance_from_level?: number | null
          event_time?: string
          event_type?: string
          id?: string
          level_id?: string | null
          macd_at_event?: number | null
          pattern_at_event?: string | null
          price_at_event?: number
          result_direction?: string | null
          result_pnl_1h?: number | null
          result_pnl_4h?: number | null
          rsi_at_event?: number | null
          timeframe?: string
          volume_at_event?: number | null
        }
        Relationships: []
      }
      strategy_stats: {
        Row: {
          best_pattern: string | null
          current_min_score: number | null
          current_sl: number | null
          current_tp: number | null
          expectancy: number | null
          id: string
          losing_trades: number | null
          max_drawdown: number | null
          period_end: string | null
          period_start: string | null
          profit_factor: number | null
          sharpe_ratio: number | null
          stats_period: string
          timeframe: string
          total_pnl: number | null
          total_trades: number | null
          updated_at: string
          win_rate: number | null
          winning_trades: number | null
          worst_pattern: string | null
        }
        Insert: {
          best_pattern?: string | null
          current_min_score?: number | null
          current_sl?: number | null
          current_tp?: number | null
          expectancy?: number | null
          id?: string
          losing_trades?: number | null
          max_drawdown?: number | null
          period_end?: string | null
          period_start?: string | null
          profit_factor?: number | null
          sharpe_ratio?: number | null
          stats_period: string
          timeframe: string
          total_pnl?: number | null
          total_trades?: number | null
          updated_at?: string
          win_rate?: number | null
          winning_trades?: number | null
          worst_pattern?: string | null
        }
        Update: {
          best_pattern?: string | null
          current_min_score?: number | null
          current_sl?: number | null
          current_tp?: number | null
          expectancy?: number | null
          id?: string
          losing_trades?: number | null
          max_drawdown?: number | null
          period_end?: string | null
          period_start?: string | null
          profit_factor?: number | null
          sharpe_ratio?: number | null
          stats_period?: string
          timeframe?: string
          total_pnl?: number | null
          total_trades?: number | null
          updated_at?: string
          win_rate?: number | null
          winning_trades?: number | null
          worst_pattern?: string | null
        }
        Relationships: []
      }
      sync_tracker: {
        Row: {
          cursor: string | null
          error_log: string | null
          is_completed: boolean | null
          rows_synced: number | null
          status: string | null
          table_name: string
          total_rows: number | null
          updated_at: string | null
        }
        Insert: {
          cursor?: string | null
          error_log?: string | null
          is_completed?: boolean | null
          rows_synced?: number | null
          status?: string | null
          table_name: string
          total_rows?: number | null
          updated_at?: string | null
        }
        Update: {
          cursor?: string | null
          error_log?: string | null
          is_completed?: boolean | null
          rows_synced?: number | null
          status?: string | null
          table_name?: string
          total_rows?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trade_ml_memory: {
        Row: {
          ai_autopsy_report: string | null
          ai_key_metrics: Json | null
          ai_lesson_learned: string | null
          created_at: string | null
          direction: string
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          id: string
          indicators_snapshot: Json | null
          is_win: boolean | null
          liquidity_snapshot: Json | null
          macro_snapshot: Json | null
          market_embedding: Json | null
          market_snapshot: Json | null
          patterns_snapshot: Json | null
          pnl_percent: number | null
          signal_id: string | null
          strategy_name: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          ai_autopsy_report?: string | null
          ai_key_metrics?: Json | null
          ai_lesson_learned?: string | null
          created_at?: string | null
          direction: string
          entry_price: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          indicators_snapshot?: Json | null
          is_win?: boolean | null
          liquidity_snapshot?: Json | null
          macro_snapshot?: Json | null
          market_embedding?: Json | null
          market_snapshot?: Json | null
          patterns_snapshot?: Json | null
          pnl_percent?: number | null
          signal_id?: string | null
          strategy_name: string
          symbol?: string
          updated_at?: string | null
        }
        Update: {
          ai_autopsy_report?: string | null
          ai_key_metrics?: Json | null
          ai_lesson_learned?: string | null
          created_at?: string | null
          direction?: string
          entry_price?: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          indicators_snapshot?: Json | null
          is_win?: boolean | null
          liquidity_snapshot?: Json | null
          macro_snapshot?: Json | null
          market_embedding?: Json | null
          market_snapshot?: Json | null
          patterns_snapshot?: Json | null
          pnl_percent?: number | null
          signal_id?: string | null
          strategy_name?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trader_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          message: string | null
          position_id: string | null
          severity: string | null
          timeframe: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          message?: string | null
          position_id?: string | null
          severity?: string | null
          timeframe?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          message?: string | null
          position_id?: string | null
          severity?: string | null
          timeframe?: string | null
        }
        Relationships: []
      }
      trading_signals: {
        Row: {
          created_at: string
          direction: string
          entry_price: number
          exit_price: number | null
          exit_time: string | null
          expires_at: string | null
          id: string
          pattern_id: string | null
          pattern_name: string
          pnl_percent: number | null
          signal_score: number | null
          sl_percent: number
          status: string
          stop_loss: number
          take_profit: number
          telegram_sent: boolean | null
          telegram_sent_at: string | null
          timeframe: string
          tp_percent: number
        }
        Insert: {
          created_at?: string
          direction: string
          entry_price: number
          exit_price?: number | null
          exit_time?: string | null
          expires_at?: string | null
          id?: string
          pattern_id?: string | null
          pattern_name: string
          pnl_percent?: number | null
          signal_score?: number | null
          sl_percent: number
          status?: string
          stop_loss: number
          take_profit: number
          telegram_sent?: boolean | null
          telegram_sent_at?: string | null
          timeframe: string
          tp_percent: number
        }
        Update: {
          created_at?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          exit_time?: string | null
          expires_at?: string | null
          id?: string
          pattern_id?: string | null
          pattern_name?: string
          pnl_percent?: number | null
          signal_score?: number | null
          sl_percent?: number
          status?: string
          stop_loss?: number
          take_profit?: number
          telegram_sent?: boolean | null
          telegram_sent_at?: string | null
          timeframe?: string
          tp_percent?: number
        }
        Relationships: []
      }
      tradingview_signals: {
        Row: {
          ai_future_10b: string | null
          chart_url: string | null
          close_price: number | null
          created_at: string
          current_price: number | null
          high_price: number | null
          id: string
          low_price: number | null
          macro_spx_dxy: string | null
          matrix_phase: string | null
          net_profit: string | null
          open_price: number | null
          patterns_detected: string[] | null
          processed_at: string | null
          raw_data: Json | null
          screenshot_url: string | null
          sentiment_20ind: string | null
          signal: string | null
          signal_direction: string | null
          signal_type: string | null
          signal_value: number | null
          status: string | null
          symbol: string
          timeframe: string
          updated_at: string
          user_id: string | null
          whale_flow: string | null
          win_rate: number | null
        }
        Insert: {
          ai_future_10b?: string | null
          chart_url?: string | null
          close_price?: number | null
          created_at?: string
          current_price?: number | null
          high_price?: number | null
          id?: string
          low_price?: number | null
          macro_spx_dxy?: string | null
          matrix_phase?: string | null
          net_profit?: string | null
          open_price?: number | null
          patterns_detected?: string[] | null
          processed_at?: string | null
          raw_data?: Json | null
          screenshot_url?: string | null
          sentiment_20ind?: string | null
          signal?: string | null
          signal_direction?: string | null
          signal_type?: string | null
          signal_value?: number | null
          status?: string | null
          symbol?: string
          timeframe?: string
          updated_at?: string
          user_id?: string | null
          whale_flow?: string | null
          win_rate?: number | null
        }
        Update: {
          ai_future_10b?: string | null
          chart_url?: string | null
          close_price?: number | null
          created_at?: string
          current_price?: number | null
          high_price?: number | null
          id?: string
          low_price?: number | null
          macro_spx_dxy?: string | null
          matrix_phase?: string | null
          net_profit?: string | null
          open_price?: number | null
          patterns_detected?: string[] | null
          processed_at?: string | null
          raw_data?: Json | null
          screenshot_url?: string | null
          sentiment_20ind?: string | null
          signal?: string | null
          signal_direction?: string | null
          signal_type?: string | null
          signal_value?: number | null
          status?: string | null
          symbol?: string
          timeframe?: string
          updated_at?: string
          user_id?: string | null
          whale_flow?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key: string
          api_secret: string
          created_at: string
          exchange: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          api_secret: string
          created_at?: string
          exchange: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          api_secret?: string
          created_at?: string
          exchange?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          alert_price_above: number | null
          alert_price_below: number | null
          alert_triggered: boolean | null
          created_at: string
          exchange: string
          id: string
          notes: string | null
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_price_above?: number | null
          alert_price_below?: number | null
          alert_triggered?: boolean | null
          created_at?: string
          exchange?: string
          id?: string
          notes?: string | null
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_price_above?: number | null
          alert_price_below?: number | null
          alert_triggered?: boolean | null
          created_at?: string
          exchange?: string
          id?: string
          notes?: string | null
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
