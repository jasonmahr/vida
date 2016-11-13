//
//  VisitorViewController.swift
//  Vida
//
//  Created by Ryoya Ogishima on 11/12/16.
//  Copyright © 2016 YHack16. All rights reserved.
//

import UIKit

class VisitorViewController: UIViewController, UITextFieldDelegate {

    @IBOutlet weak var label: UILabel!
    @IBOutlet weak var email_out: UITextField!
    @IBOutlet weak var pass_out: UITextField!
    
    var email_txt = ""
    var pass_txt = ""
    var tmp = 0
    // wait until postAsync ends
    let semaphore = DispatchSemaphore(value: 0)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
        label.text = ""
        self.email_out.delegate = self
        self.pass_out.delegate = self
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func email(_ sender: UITextField) {
        email_txt = sender.text!
    }
    @IBAction func password(_ sender: UITextField) {
        pass_txt = sender.text!
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        self.view.endEditing(true)
        return false
    }
    
    func postAsync(sender: AnyObject) {
        
        // create the url-request
        let urlString = "https://vida.herokuapp.com/api/login"
        let request = NSMutableURLRequest(url: NSURL(string: urlString)! as URL)
        
        // set the method(HTTP-POST)
        request.httpMethod = "POST"
        // set the header(s)
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // set the request-body(JSON)
//        var params: [String: AnyObject] = [
//            "foo": "bar" as AnyObject,
//            "baz": [
//                "a": 1,
//                "b": 20,
//                "c": 300
//            ]
//        ]
        
        // prepare json data
        let params = [ "email": email_txt, "password": pass_txt] as [String : Any]
        print(email_txt)
        print(pass_txt)
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: params)
        }catch _ as NSError{}
        
        // use NSURLSessionDataTask
        let task = URLSession.shared.dataTask(with: request as URLRequest, completionHandler: {data, response, error in
            if (error == nil) {
                let result = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)!
                print(result)
                var json = JSON(data: data!)
                print(json["success"])
                if json["success"] == true{
                    self.tmp = 1
                }
            } else {
                print(error as Any)
            }
            self.semaphore.signal()
        })
        task.resume()
    }
    
    @IBAction func login_button(_ sender: UIButton) {
        postAsync(sender: sender)
        self.semaphore.wait()
        print(self.tmp)
        if tmp == 1 {
            let storyboard: UIStoryboard = self.storyboard!
            let nextView = storyboard.instantiateViewController(withIdentifier: "next") as! UITabBarController
            self.present(nextView, animated: true, completion: nil)
        }
        else {
            label.text = "Login failed! Try again! :D"
        }
    }
}
