class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base || Rails.application.secrets.secret_key_base
  
  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end
  
  def self.decode(token)
    raise JWT::DecodeError, "Token is nil" if token.nil? # 追加
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  # rescue JWT::DecodeError, JWT::ExpiredSignature => e # コントローラー側でrescueする
  #   nil
  end
end