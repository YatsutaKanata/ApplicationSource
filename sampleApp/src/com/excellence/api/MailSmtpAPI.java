package com.excellence.api;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.security.Security;
import java.util.*;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;
import javax.mail.*;
import javax.mail.internet.*;

/**
 * メール用クラス
 * @auther S.Yoshizawa
 */
public class MailSmtpAPI {

	private String subject = "";
	private String msg = "";
	private String host = "";
	private int port = 25;
	private String account = "";
	private String password = "";
	private String enc = "iso-2022-jp"; //エンコード

	private String errormsg = "";
	private String debug = "";

	private String[] filename = null;

	/**
	 * コンストラクタ
	 */
	public MailSmtpAPI(){}

	public MailSmtpAPI(String host,String account,String password){
		  	//情報をセットします。
			setUserInfo(host,account,password);
	}

	/**
	 * セットメソッド<br>
	 */
	public void setAccount(String account){
		this.account = account;
	}

	public void setPassword(String password){
		this.password = password;
	}

	public void setUserInfo(String host,String account,String password){
	    setHost(host)	;
	    setAccount(account)	;
	    setPassword(password);
	}

	/**
	 * SMTPサーバーのセット
	 */
	public void setHost(String str){
		this.host = str;
	}

	/**
	 * タイトルセット
	 */
	public void setSubject(String str){
		this.subject = str;
	}

	/**
	 * 内容セット
	 */
	public void setMsg(String str){
		this.msg = str;
	}

	/**
	 * ポートセット
	 * @param port
	 */
	public void setPort(int port){
		  this.port = port;
	}

	/**
	 * 障害内容取得
	 */
	public String getMailErr(){
		return this.errormsg;
	}

	/**
	 * デバックメッセージ取得
	 */
	public String getMailDebug(){
	    return this.debug;
	}

	/**
	 * エンコードセット
	 * @param enc
	 */
	public void setEncode(String enc){
	  this.enc = enc;
	}

	/**
	 * 添付するファイル名（フルパス）をセット
	 * @param filename
	 */
	public void setFile(String[] filenames){
		this.filename = filenames;
	}

	/**
	 * メールセット
	 * @param namae : 送信者名
	 * @param from : 送信アドレス
	 * @param to : あて先アドレス
	 * @param cc : CCアドレス
	 * @param bcc : BCCアドレス
	 */
	public boolean sendmail(String namae,String from,String to,String cc,String bcc) {

		String smtpHost = this.host;
		String subject = this.subject;
		String msgTxt = this.msg;
		final String fromaddr = from;
		final String passwordstr = this.password;

		try {
			// Propertiesクラスのインスタンスを生成
			Properties props = new Properties();

			// SMTPサーバーのアドレスを指定
			props.setProperty("mail.smtp.host",smtpHost);
			props.setProperty("mail.smtp.port",""+this.port);

	        // タイムアウト設定
	        props.setProperty("mail.smtp.connectiontimeout", "60000");
	        props.setProperty("mail.smtp.timeout", "60000");

	        Session session;
			//SSL使用対応
	    	//-----------------------------------------------------------------------
			if (this.port == 465 || this.port == 587) {
				Security.addProvider( new com.sun.net.ssl.internal.ssl.Provider());

				final String SSL_FACTORY = "javax.net.ssl.SSLSocketFactory";

				// POP3 provider
				props.setProperty( "mail.smtp.socketFactory.class", SSL_FACTORY);

				// POP3 provider
				props.setProperty( "mail.smtp.socketFactory.fallback", "false");

				// POP3 provider
				props.setProperty( "mail.smtp.socketFactory.port", ""+this.port);
				// 認証
		        props.setProperty("mail.smtp.auth", "true");
		        session = Session.getInstance(props, new Authenticator() {
		            protected PasswordAuthentication getPasswordAuthentication() {
		                return new PasswordAuthentication(fromaddr, passwordstr);
		            }
		        });
			}else{
				session=Session.getDefaultInstance(props,null);
			}

	    	//-----------------------------------------------------------------------

			MimeMessage msg=new MimeMessage(session);

			// 送信元メールアドレスと送信者名を指定
			if(! this.enc.equals("")){
				msg.setFrom(new InternetAddress(from,namae,this.enc));
			}else{
				msg.setFrom(new InternetAddress(from,namae));
			}

			// 送信先メールアドレスを指定
			msg.setRecipients(Message.RecipientType.TO,to);

			// 送信先メールアドレス(CC)を指定
			msg.setRecipients(Message.RecipientType.CC,cc);

			// 送信先メールアドレス(BCC)を指定
			msg.setRecipients(Message.RecipientType.BCC,bcc);

			// メールの件名を指定
			if(! this.enc.equals("")){
				msg.setSubject(subject,this.enc);
			} else {
				msg.setSubject(subject);
			}

			// メールの文章を指定
			if(! this.enc.equals("")){
				msg.setText(msgTxt,this.enc);
			}else{
				msg.setText(msgTxt);
			}

			// メールの形式を指定
			if(! this.enc.equals("")){
				msg.setHeader("Content-Type","text/plain;charset=" + this.enc);
			}else{
				msg.setHeader("Content-Type","text/plain");
			}
			msg.setHeader("Content-Transfer-Encoding", "7bit");
			msg.addHeader("X-Mailer", "ExcellenceMail");

			//添付ファイルを指定
			if(this.filename != null){
				for(int i=0;i<this.filename.length;i++){
					File f = new File(this.filename[i]);
					if(f.exists()){
						//ファイルが存在する場合のみ
						MimeBodyPart mbp = new MimeBodyPart();
						mbp.setDataHandler(new DataHandler(new FileDataSource(this.filename[i])));
						mbp.setFileName(MimeUtility.encodeText(f.getName(), this.enc, "B"));
						//mbp.setFileName(f.getName());

						Multipart mp = new MimeMultipart();
						mp.addBodyPart(mbp);
						msg.setContent(mp);
					}
				}
			}

			// 送信日付を指定
			msg.setSentDate(new Date());

			// 送信
			Transport.send(msg);

			//System.out.println("メールの送信が完了しました。");
			return true;
		} catch (Exception e) {
			this.errormsg = "" + e;
			return false;
		}
	}

	/**
	 * メールセット
	 * @param namae : 送信者名
	 * @param from : 送信アドレス
	 * @param to : あて先アドレス
	 * @param cc : CCアドレス
	 * @param bcc : BCCアドレス
	 */
	public boolean sendmail(String namae,String from,Address[] to,Address[] cc,Address[] bcc) {

		String smtpHost = this.host;
		String subject = this.subject;
		String msgTxt = this.msg;
		final String user = this.account;
		final String password = this.password;

		try {
			// Propertiesクラスのインスタンスを生成
			Properties props = new Properties();

			// SMTPサーバーのアドレスを指定
			props.setProperty("mail.smtp.host",smtpHost);
			props.setProperty("mail.smtp.port",""+this.port);

	        // タイムアウト設定
	        props.setProperty("mail.smtp.connectiontimeout", "60000");
	        props.setProperty("mail.smtp.timeout", "60000");

	        Session session;
			//SSL使用対応
	    	//-----------------------------------------------------------------------
			if (this.port == 465 || this.port == 587) {
				Security.addProvider( new com.sun.net.ssl.internal.ssl.Provider());

				final String SSL_FACTORY = "javax.net.ssl.SSLSocketFactory";

				// POP3 provider
				props.setProperty( "mail.smtp.socketFactory.class", SSL_FACTORY);

				// POP3 provider
				props.setProperty( "mail.smtp.socketFactory.fallback", "false");

				// POP3 provider
				props.setProperty( "mail.smtp.socketFactory.port", ""+this.port);
				// 認証
		        props.setProperty("mail.smtp.auth", "true");
		        session = Session.getInstance(props, new Authenticator() {
		            protected PasswordAuthentication getPasswordAuthentication() {
		                return new PasswordAuthentication(user, password);
		            }
		        });
			}else{
				session=Session.getDefaultInstance(props,null);
			}

	    	//-----------------------------------------------------------------------

			MimeMessage msg=new MimeMessage(session);

			// 送信元メールアドレスと送信者名を指定
			if(! this.enc.equals("")){
				msg.setFrom(new InternetAddress(from,namae,this.enc));
			}else{
				msg.setFrom(new InternetAddress(from,namae));
			}

			// 送信先メールアドレスを指定
			if(to!=null){
				msg.setRecipients(Message.RecipientType.TO,to);
			}

			// 送信先メールアドレス(CC)を指定
			if(cc!=null){
				msg.setRecipients(Message.RecipientType.CC,cc);
			}

			// 送信先メールアドレス(BCC)を指定
			if(bcc!=null){
				msg.setRecipients(Message.RecipientType.BCC,bcc);
			}

			// メールの件名を指定
			if(! this.enc.equals("")){
				msg.setSubject(subject,this.enc);
			} else {
				msg.setSubject(subject);
			}

			// メールの形式を指定
			if(! this.enc.equals("")){
				msg.setHeader("Content-Type","text/plain;charset=" + this.enc);
			}else{
				msg.setHeader("Content-Type","text/plain");
			}
			msg.setHeader("Content-Transfer-Encoding", "7bit");
			msg.addHeader("X-Mailer", "ExcellenceMail");

			//添付ファイルを指定
			if(this.filename != null){
				MimeMultipart content = new MimeMultipart();

				//本文をMultipartにセット
				MimeBodyPart text = new MimeBodyPart();
				text.setContent(msgTxt, "text/plain; charset=iso-2022-jp");
				text.setHeader("Content-Transfer-Encoding","7bit");
				content.addBodyPart(text);

				//添付ファイルをMultipartにセット
				for(int i=0;i<this.filename.length;i++){
					File f = new File(this.filename[i]);
					if(f.exists()){
						//ファイルが存在する場合のみ
						MimeBodyPart mbp = new MimeBodyPart();
						mbp.setDataHandler(new DataHandler(new FileDataSource(this.filename[i])));
						mbp.setFileName(MimeUtility.encodeText(f.getName(), this.enc, "B"));
						//mbp.setFileName(f.getName());
						this.debug = this.debug + "<br>TempFile:" + f.getName();

						content.addBodyPart(mbp);
					}
				}

				//データにMultipartをセット
				msg.setContent(content);
			}else{
				//データに本文を直接セット
				// メールの文章を指定
				if(! this.enc.equals("")){
					msg.setText(msgTxt,this.enc);
				}else{
					msg.setText(msgTxt);
				}
			}

			// 送信日付を指定
			msg.setSentDate(new Date());

			// 送信
			Transport.send(msg);

			//System.out.println("メールの送信が完了しました。");
			return true;
		} catch (Exception e) {
			this.errormsg = "" + e;
			return false;
		}
	}

	/**
	 * アドレス型変換
	 * @param address
	 * @return
	 */
	public Address[] stringAddressConvert(String[] address){
		if(address == null){
			return null;
		}
		Address[] adrs = new Address[address.length];
		for(int i=0;i<address.length;i++){
			try {
				Address adr = new InternetAddress(address[i]);
				adrs[i] = adr;
			} catch (AddressException e) {
				adrs = null;
			}
		}
		return adrs;
	}

	/**
	 * 名前付随アドレス型変換
	 * @param address
	 * @param name
	 * @return
	 */
	public Address[] stringAddressConvert(String[] address,String[] name){
		Address[] adrs = new Address[address.length];
		for(int i=0;i<address.length;i++){
			try {
				Address adr = new InternetAddress(address[i],name[i]);
				adrs[i] = adr;
			} catch (UnsupportedEncodingException e) {
				adrs = null;
			}
		}
		return adrs;
	}
}

